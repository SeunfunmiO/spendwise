"use server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import type { ActionResult, BudgetData, BudgetInput } from "@/types"
import connectDb from "../mongodb"
import User from "@/models/User"
import Budget from "@/models/Budget"
import Transaction from "@/models/Transaction"

// ---- Helper: get session user ----
async function getSessionUser() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")
    await connectDb()
    const user = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")
    return user._id
}

// ---- Helper: get current period strings ----
function getCurrentPeriods() {
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const year = `${now.getFullYear()}`

    // ISO week number
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const weekNum = Math.ceil(
        ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    )
    const week = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`

    return { month, week, year }
}

// ---- Helper: get date range for period ----
function getPeriodDateRange(period: string, periodValue: string) {
    if (period === "monthly") {
        const [y, m] = periodValue.split("-").map(Number)
        return {
            start: new Date(y, m - 1, 1),
            end: new Date(y, m, 0),
        }
    }

    if (period === "annual") {
        const y = Number(periodValue)
        return {
            start: new Date(y, 0, 1),
            end: new Date(y, 11, 31),
        }
    }

    // Weekly
    const [yearStr, weekStr] = periodValue.split("-W")
    const y = Number(yearStr)
    const w = Number(weekStr)
    const startOfYear = new Date(y, 0, 1)
    const start = new Date(startOfYear.getTime() + (w - 1) * 7 * 86400000)
    const end = new Date(start.getTime() + 6 * 86400000)
    return { start, end }
}

// ---- Helper: serialize ----
function serialize(doc: any, spent: number): BudgetData {
    const obj = doc.toObject ? doc.toObject() : doc
    const remaining = obj.limit - spent
    const percentUsed = obj.limit > 0 ? Math.round((spent / obj.limit) * 100) : 0
    return {
        ...obj,
        _id: obj._id.toString(),
        userId: obj.userId.toString(),
        spent,
        remaining,
        percentUsed,
        isOverBudget: spent > obj.limit,
        createdAt: obj.createdAt.toISOString(),
        updatedAt: obj.updatedAt.toISOString(),
    }
}

// ---- GET ALL BUDGETS ----
export async function getBudgets(): Promise<ActionResult<BudgetData[]>> {
    try {
        const userId = await getSessionUser()
        const { month, week, year } = getCurrentPeriods()

        const budgets = await Budget.find({ userId }).sort({ createdAt: -1 })

        const budgetsWithSpent = await Promise.all(
            budgets.map(async (budget) => {
                const periodValue =
                    budget.period === "monthly"
                        ? budget.month
                        : budget.period === "weekly"
                            ? budget.week
                            : budget.year

                const { start, end } = getPeriodDateRange(budget.period, periodValue)

                const transactions = await Transaction.find({
                    userId,
                    category: budget.category,
                    type: "expense",
                    date: { $gte: start, $lte: end },
                })

                const spent = transactions.reduce((sum, t) => sum + t.amount, 0)
                return serialize(budget, spent)
            })
        )

        return { success: true, data: budgetsWithSpent }
    } catch (error) {
        console.error("getBudgets error:", error)
        return { success: false, error: "Failed to fetch budgets" }
    }
}

// ---- CREATE BUDGET ----
export async function createBudget(
    input: BudgetInput
): Promise<ActionResult<BudgetData>> {
    try {
        const userId = await getSessionUser()
        const { month, week, year } = getCurrentPeriods()

        if (!input.category || !input.limit || !input.period) {
            return { success: false, error: "All fields are required" }
        }

        // Check for duplicate budget for same category + period
        const existing = await Budget.findOne({
            userId,
            category: input.category,
            period: input.period,
            ...(input.period === "monthly" && { month }),
            ...(input.period === "weekly" && { week }),
            ...(input.period === "annual" && { year }),
        })

        if (existing) {
            return {
                success: false,
                error: `A ${input.period} budget for ${input.category} already exists`,
            }
        }

        const budget = await Budget.create({
            userId,
            category: input.category,
            limit: input.limit,
            period: input.period,
            month,
            week,
            year,
        })

        revalidatePath("/budgets")
        revalidatePath("/")

        return {
            success: true,
            data: serialize(budget, 0),
            message: "Budget created successfully",
        }
    } catch (error) {
        console.error("createBudget error:", error)
        return { success: false, error: "Failed to create budget" }
    }
}

// ---- UPDATE BUDGET ----
export async function updateBudget(
    id: string,
    input: Partial<BudgetInput>
): Promise<ActionResult<BudgetData>> {
    try {
        const userId = await getSessionUser()

        const budget = await Budget.findOneAndUpdate(
            { _id: id, userId },
            { limit: input.limit },
            { new: true }
        )

        if (!budget) {
            return { success: false, error: "Budget not found" }
        }

        revalidatePath("/budgets")
        revalidatePath("/")

        return {
            success: true,
            data: serialize(budget, 0),
            message: "Budget updated successfully",
        }
    } catch (error) {
        console.error("updateBudget error:", error)
        return { success: false, error: "Failed to update budget" }
    }
}

// ---- DELETE BUDGET ----
export async function deleteBudget(id: string): Promise<ActionResult> {
    try {
        const userId = await getSessionUser()

        const budget = await Budget.findOneAndDelete({ _id: id, userId })

        if (!budget) {
            return { success: false, error: "Budget not found" }
        }

        revalidatePath("/budgets")
        revalidatePath("/")

        return { success: true, message: "Budget deleted successfully" }
    } catch (error) {
        console.error("deleteBudget error:", error)
        return { success: false, error: "Failed to delete budget" }
    }
}