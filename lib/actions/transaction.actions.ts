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

async function getSessionUser() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    return session.user.id
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

        // Use customCategory value if "Other" was selected
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