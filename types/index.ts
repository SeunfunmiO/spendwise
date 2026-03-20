

export type RegisterResult =
    | { success: true; message: string }
    | { success: false; error: string }

export type SignInResult =
    | { success: true }
    | { success: false; error: string }

export interface TransactionData {
    _id: string
    userId: string
    title: string
    amount: number
    type: "income" | "expense"
    category: string
    date: string
    note?: string
    isRecurring: boolean
    recurringInterval?: "daily" | "weekly" | "monthly"
    createdAt: string
    updatedAt: string
}

export interface TransactionFilters {
    type?: "income" | "expense" | "all"
    category?: string
    dateFrom?: string
    dateTo?: string
    search?: string
}

export type ActionResult<T = void> =
    | { success: true; data?: T; message?: string }
    | { success: false; error: string }

export type { TransactionInput } from "@/lib/schemas"

export interface BudgetData {
    _id: string
    userId: string
    category: string
    limit: number
    period: "weekly" | "monthly" | "annual"
    month: string
    week: string
    year: string
    spent: number          // calculated from transactions
    remaining: number      // calculated
    percentUsed: number    // calculated
    isOverBudget: boolean  // calculated
    createdAt: string
    updatedAt: string
}

export interface BudgetInput {
    category: string
    limit: number
    period: "weekly" | "monthly" | "annual"
}
