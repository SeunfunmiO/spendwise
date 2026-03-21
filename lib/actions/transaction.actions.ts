"use server"
import { revalidatePath } from "next/cache"
import Transaction from "@/models/Transaction"
import { auth } from "@/lib/auth"
import type {
    TransactionInput,
    TransactionFilters,
    ActionResult,
    TransactionData,
} from "@/types"
import connectDb from "../mongodb"
import User from "@/models/User"
import Budget from "@/models/Budget"
import { sendBudgetAlertEmail } from "../email"
// ---- Helper: get session or throw ----
async function getSessionUser() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    // Fetch the actual MongoDB user by email to get the real _id
    await connectDb()
    const user = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    return user._id
}

function serialize(doc: any): TransactionData {
    const obj = doc.toObject ? doc.toObject() : doc
    return {
        ...obj,
        _id: obj._id.toString(),
        userId: obj.userId.toString(),
        date: obj.date.toISOString(),
        createdAt: obj.createdAt.toISOString(),
        updatedAt: obj.updatedAt.toISOString(),
    }
}

// ---- GET ALL ----
export async function getTransactions(
    filters: TransactionFilters = {}
): Promise<ActionResult<TransactionData[]>> {
    try {
        const userId = await getSessionUser()
        await connectDb()

        const query: any = { userId }

        if (filters.type && filters.type !== "all") {
            query.type = filters.type
        }

        if (filters.category) {
            query.category = filters.category
        }

        if (filters.dateFrom || filters.dateTo) {
            query.date = {}
            if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom)
            if (filters.dateTo) query.date.$lte = new Date(filters.dateTo)
        }

        if (filters.search) {
            query.title = { $regex: filters.search, $options: "i" }
        }

        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .limit(100)

        return { success: true, data: transactions.map(serialize) }
    } catch (error) {
        console.error("getTransactions error:", error)
        return { success: false, error: "Failed to fetch transactions" }
    }
}
async function checkBudgetAlert(
    userId: any,
    category: string,
    userEmail: string,
    userName: string
) {
    try {
        const now = new Date()

        const budget = await Budget.findOne({ userId, category, period: "monthly" })
        if (!budget) return

        const user = await User.findById(userId)
        if (!user?.budgetAlerts) return

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        const transactions = await Transaction.find({
            userId,
            category,
            type: "expense",
            date: { $gte: startOfMonth, $lte: endOfMonth },
        })

        const spent = transactions.reduce((sum, t) => sum + t.amount, 0)
        const percentage = (spent / budget.limit) * 100

        // Send 80% alert only once
        if (percentage >= 80 && percentage < 100 && !budget.alertSent80) {
            await sendBudgetAlertEmail(
                userName, userEmail, category, spent, budget.limit, Math.round(percentage)
            )
            await Budget.findByIdAndUpdate(budget._id, {
                alertSent80: true,
                alertSent100: false, // reset 100% flag in case they paid some back
            })
        }

        // Send 100% alert only once
        if (percentage >= 100 && !budget.alertSent100) {
            await sendBudgetAlertEmail(
                userName, userEmail, category, spent, budget.limit, Math.round(percentage), true
            )
            await Budget.findByIdAndUpdate(budget._id, { alertSent100: true })
        }

        // Reset flags if spending drops below 80% (e.g. transaction deleted)
        if (percentage < 80 && (budget.alertSent80 || budget.alertSent100)) {
            await Budget.findByIdAndUpdate(budget._id, {
                alertSent80: false,
                alertSent100: false,
            })
        }
    } catch (error) {
        console.error("Budget alert check error:", error)
    }
}
// ---- CREATE ----
export async function createTransaction(
    input: TransactionInput
): Promise<ActionResult<TransactionData>> {
    try {
        const userId = await getSessionUser()
        await connectDb()

        if (!input.title || !input.amount || !input.type || !input.category || !input.date) {
            return { success: false, error: "All required fields must be filled" }
        }

        if (input.amount <= 0) {
            return { success: false, error: "Amount must be greater than zero" }
        }

        const finalCategory =
            input.category === "Other" && input.customCategory?.trim()
                ? input.customCategory.trim()
                : input.category

        const transaction = await Transaction.create({
            userId,
            title: input.title,
            amount: input.amount,
            type: input.type,
            category: finalCategory,
            date: new Date(input.date),
            note: input.note,
            isRecurring: input.isRecurring,
            recurringInterval: input.recurringInterval,
        })

        // 👇 Check budget alert after expense transaction is created
        if (transaction.type === "expense") {
            const user = await User.findById(userId)
            // 👇 Only send alerts for premium users
            if (user?.plan === "premium" && user?.budgetAlerts) {
                await checkBudgetAlert(userId, finalCategory, user.email, user.name)
            }
        }
        
        // Check free plan transaction limit
        const user = await User.findById(userId)
        if (user?.plan === "free") {
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

            const count = await Transaction.countDocuments({
                userId,
                date: { $gte: startOfMonth, $lte: endOfMonth },
            })

            if (count >= 50) {
                return {
                    success: false,
                    error: "Free plan limit reached. Upgrade to Premium for unlimited transactions.",
                }
            }
        }
        
        revalidatePath("/")
        revalidatePath("/transactions")
        revalidatePath("/reports")

        return {
            success: true,
            data: serialize(transaction),
            message: "Transaction added successfully",
        }
    } catch (error) {
        console.error("createTransaction error:", error)
        return { success: false, error: "Failed to create transaction" }
    }
}

// ---- UPDATE ----
export async function updateTransaction(
    id: string,
    input: Partial<TransactionInput>
): Promise<ActionResult<TransactionData>> {
    try {
        const userId = await getSessionUser()
        await connectDb()

        const finalCategory =
            input.category === "Other" && input.customCategory?.trim()
                ? input.customCategory.trim()
                : input.category

        const transaction = await Transaction.findOneAndUpdate(
            { _id: id, userId },
            {
                title: input.title,
                amount: input.amount,
                type: input.type,
                category: finalCategory,
                date: input.date ? new Date(input.date) : undefined,
                note: input.note,
                isRecurring: input.isRecurring,
                recurringInterval: input.recurringInterval,
            },
            { new: true }
        )

        if (!transaction) {
            return { success: false, error: "Transaction not found" }
        }

        revalidatePath("/")
        revalidatePath("/transactions")
        revalidatePath("/reports")

        return {
            success: true,
            data: serialize(transaction),
            message: "Transaction updated successfully",
        }
    } catch (error) {
        console.error("updateTransaction error:", error)
        return { success: false, error: "Failed to update transaction" }
    }
}

// ---- DELETE ----
export async function deleteTransaction(
    id: string
): Promise<ActionResult> {
    try {
        const userId = await getSessionUser()
        await connectDb()

        const transaction = await Transaction.findOneAndDelete({ _id: id, userId })

        if (!transaction) {
            return { success: false, error: "Transaction not found" }
        }

        revalidatePath("/")
        revalidatePath("/transactions")
        revalidatePath("/reports")

        return { success: true, message: "Transaction deleted successfully" }
    } catch (error) {
        console.error("deleteTransaction error:", error)
        return { success: false, error: "Failed to delete transaction" }
    }
}