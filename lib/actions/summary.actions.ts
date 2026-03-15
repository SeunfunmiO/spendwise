"use server"
import { auth } from "@/lib/auth"
import connectDb from "../mongodb"
import { ActionResult, TransactionData } from "@/types"
import Transaction from "@/models/Transaction"
import User from "@/models/User"

// ---- Helper ----
async function getSessionUser() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")
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

export interface MonthlySummary {
    totalIncome: number
    totalExpenses: number
    netBalance: number
    savingsRate: number
    recentTransactions: TransactionData[]
    categoryBreakdown: { category: string; amount: number; color: string }[]
    monthlyTrend: { month: string; income: number; expenses: number }[]
}

export async function getMonthlySummary(): Promise<ActionResult<MonthlySummary>> {
    try {
        const userId = await getSessionUser()

        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        // ---- This month's transactions ----
        const monthlyTransactions = await Transaction.find({
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
        }).sort({ date: -1 })

        const totalIncome = monthlyTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0)

        const totalExpenses = monthlyTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0)

        const netBalance = totalIncome - totalExpenses
        const savingsRate = totalIncome > 0
            ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
            : 0

        // ---- Recent 5 transactions ----
        const recentTransactions = await Transaction.find({ userId })
            .sort({ date: -1 })
            .limit(5)

        // ---- Category breakdown (expenses only) ----
        const categoryColors: Record<string, string> = {
            "Food & Dining": "#f59e0b",
            "Transport": "#3b82f6",
            "Housing & Rent": "#8b5cf6",
            "Healthcare": "#ef4444",
            "Shopping": "#ec4899",
            "Entertainment": "#06b6d4",
            "Education": "#10b981",
            "Utilities": "#f97316",
            "Salary": "#10b981",
            "Freelance": "#6366f1",
            "Business": "#14b8a6",
            "Other": "#71717a",
        }

        const categoryMap: Record<string, number> = {}
        monthlyTransactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
            })

        const categoryBreakdown = Object.entries(categoryMap)
            .map(([category, amount]) => ({
                category,
                amount,
                color: categoryColors[category] ?? "#71717a",
            }))
            .sort((a, b) => b.amount - a.amount)

        // ---- Last 6 months trend ----
        const monthlyTrend = []
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const start = new Date(date.getFullYear(), date.getMonth(), 1)
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)

            const transactions = await Transaction.find({
                userId,
                date: { $gte: start, $lte: end },
            })

            const income = transactions
                .filter((t) => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0)

            const expenses = transactions
                .filter((t) => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0)

            monthlyTrend.push({
                month: date.toLocaleString("default", { month: "short" }),
                income,
                expenses,
            })
        }

        return {
            success: true,
            data: {
                totalIncome,
                totalExpenses,
                netBalance,
                savingsRate,
                recentTransactions: recentTransactions.map(serialize),
                categoryBreakdown,
                monthlyTrend,
            },
        }
    } catch (error) {
        console.error("getMonthlySummary error:", error)
        return { success: false, error: "Failed to fetch summary" }
    }
}