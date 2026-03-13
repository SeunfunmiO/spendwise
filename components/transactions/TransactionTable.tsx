"use client"
import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { deleteTransaction } from "@/lib/actions/transaction.actions"
import { getCategoryMeta } from "@/constants/categories"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { TransactionData } from "@/types"

interface Props {
    transactions: TransactionData[]
    currency: string
    onEdit: (transaction: TransactionData) => void
    onDeleted: () => void
}

export default function TransactionTable({
    transactions,
    currency,
    onEdit,
    onDeleted,
}: Props) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return
        setDeletingId(id)
        const result = await deleteTransaction(id)
        setDeletingId(null)
        if (result.success) onDeleted()
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-16 text-[var(--muted-foreground)]">
                <p className="text-4xl mb-3">💸</p>
                <p className="text-sm font-medium">No transactions yet</p>
                <p className="text-xs mt-1">Add your first transaction to get started</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 text-[var(--muted-foreground)] font-medium">
                            Title
                        </th>
                        <th className="text-left py-3 px-4 text-[var(--muted-foreground)] font-medium">
                            Category
                        </th>
                        <th className="text-left py-3 px-4 text-[var(--muted-foreground)] font-medium">
                            Date
                        </th>
                        <th className="text-right py-3 px-4 text-[var(--muted-foreground)] font-medium">
                            Amount
                        </th>
                        <th className="text-right py-3 px-4 text-[var(--muted-foreground)] font-medium">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => {
                        const meta = getCategoryMeta(tx.category)
                        const Icon = meta?.icon

                        return (
                            <tr
                                key={tx._id}
                                className="border-b border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
                            >
                                {/* Title */}
                                <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${tx.type === "income" ? "bg-emerald-500" : "bg-red-500"
                                                }`}
                                        />
                                        <span className="font-medium text-[var(--foreground)] truncate max-w-[180px]">
                                            {tx.title}
                                        </span>
                                        {tx.isRecurring && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white">
                                                recurring
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Category */}
                                <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-1.5">
                                        {Icon ? (
                                            <Icon size={14} style={{ color: meta?.color }} />
                                        ) : (
                                            // Custom category — no icon match, show colored dot instead
                                            <span
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: "#71717a" }}
                                            />
                                        )}
                                        <span className="text-[var(--muted-foreground)]">{tx.category}</span>
                                    </div>
                                </td>

                                {/* Date */}
                                <td className="py-3.5 px-4 text-[var(--muted-foreground)]">
                                    {formatDate(tx.date)}
                                </td>

                                {/* Amount */}
                                <td
                                    className={`py-3.5 px-4 text-right font-semibold ${tx.type === "income" ? "text-emerald-500" : "text-red-500"
                                        }`}
                                >
                                    {tx.type === "income" ? "+" : "-"}
                                    {formatCurrency(tx.amount, currency)}
                                </td>

                                {/* Actions */}
                                <td className="py-3.5 px-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(tx)}
                                            className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tx._id)}
                                            disabled={deletingId === tx._id}
                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-[var(--muted-foreground)] hover:text-red-500 transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}