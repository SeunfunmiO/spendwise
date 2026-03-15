"use server"
import connectDb from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import User from "@/models/User"
import { auth } from "@/lib/auth"
import type { ActionResult } from "@/types"

async function getSessionUser() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")
    await connectDb()
    const user = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")
    return user._id
}

export type ReportPeriod = "month" | "3months" | "6months" | "year"

export interface ReportsData {
    monthlyTrend: {
        month: string
        income: number
        expenses: number
        savings: number
    }[]
    categoryBreakdown: {
        category: string
        amount: number
        color: string
        percentage: number
    }[]
    topCategories: {
        category: string
        amount: number
        color: string
        count: number
    }[]
    totalIncome: number
    totalExpenses: number
    totalSavings: number
    savingsRate: number
}

export async function getReportsData(
    period: ReportPeriod = "6months"
): Promise<ActionResult<ReportsData>> {
    try {
        const userId = await getSessionUser()

        const now = new Date()
        let startDate: Date
        let monthCount: number

        switch (period) {
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                monthCount = 1
                break
            case "3months":
                startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
                monthCount = 3
                break
            case "year":
                startDate = new Date(now.getFullYear(), 0, 1)
                monthCount = 12
                break
            default: // 6months
                startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
                monthCount = 6
        }

        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        // ---- All transactions in period ----
        const allTransactions = await Transaction.find({
            userId,
            date: { $gte: startDate, $lte: endDate },
        })

        // ---- Monthly trend ----
        const monthlyTrend = []
        for (let i = monthCount - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const start = new Date(date.getFullYear(), date.getMonth(), 1)
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)

            const monthTx = allTransactions.filter((t) => {
                const d = new Date(t.date)
                return d >= start && d <= end
            })

            const income = monthTx
                .filter((t) => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0)

            const expenses = monthTx
                .filter((t) => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0)

            monthlyTrend.push({
                month: date.toLocaleString("default", { month: "short", year: "2-digit" }),
                income,
                expenses,
                savings: income - expenses,
            })
        }

        // ---- Category breakdown ----
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

        const expenses = allTransactions.filter((t) => t.type === "expense")
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
        const totalIncome = allTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0)

        const categoryMap: Record<string, { amount: number; count: number }> = {}
        expenses.forEach((t) => {
            if (!categoryMap[t.category]) {
                categoryMap[t.category] = { amount: 0, count: 0 }
            }
            categoryMap[t.category].amount += t.amount
            categoryMap[t.category].count += 1
        })

        const categoryBreakdown = Object.entries(categoryMap)
            .map(([category, { amount }]) => ({
                category,
                amount,
                color: categoryColors[category] ?? "#71717a",
                percentage: totalExpenses > 0
                    ? Math.round((amount / totalExpenses) * 100)
                    : 0,
            }))
            .sort((a, b) => b.amount - a.amount)

        const topCategories = Object.entries(categoryMap)
            .map(([category, { amount, count }]) => ({
                category,
                amount,
                color: categoryColors[category] ?? "#71717a",
                count,
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)

        const totalSavings = totalIncome - totalExpenses
        const savingsRate = totalIncome > 0
            ? Math.round((totalSavings / totalIncome) * 100)
            : 0

        return {
            success: true,
            data: {
                monthlyTrend,
                categoryBreakdown,
                topCategories,
                totalIncome,
                totalExpenses,
                totalSavings,
                savingsRate,
            },
        }
    } catch (error) {
        console.error("getReportsData error:", error)
        return { success: false, error: "Failed to fetch reports data" }
    }
}

// ---- CSV Export ----
export async function getTransactionsForExport(): Promise<ActionResult<string>> {
    try {
        const userId = await getSessionUser()

        const transactions = await Transaction.find({ userId }).sort({ date: -1 })

        const headers = ["Title", "Type", "Category", "Amount", "Date", "Note", "Recurring"]
        const rows = transactions.map((t) => [
            `"${t.title}"`,
            t.type,
            `"${t.category}"`,
            t.amount,
            new Date(t.date).toLocaleDateString(),
            `"${t.note ?? ""}"`,
            t.isRecurring ? "Yes" : "No",
        ])

        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

        return { success: true, data: csv }
    } catch (error) {
        console.error("getTransactionsForExport error:", error)
        return { success: false, error: "Failed to export transactions" }
    }
}