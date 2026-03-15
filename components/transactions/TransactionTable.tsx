"use client"
import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { deleteTransaction } from "@/lib/actions/transaction.actions"
import { getCategoryMeta } from "@/constants/categories"
import { formatCurrency, formatDate } from "@/lib/utils"
import ConfirmModal from "@/components/ui/ConfirmModal"
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
    const t = useTranslations("transactions")
    const [confirmId, setConfirmId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const handleDeleteClick = (id: string) => {
        setConfirmId(id)
    }

    const handleConfirmDelete = async () => {
        if (!confirmId) return
        setDeleting(true)
        const result = await deleteTransaction(confirmId)
        setDeleting(false)
        setConfirmId(null)
        if (result.success) onDeleted()
    }

    const handleCancelDelete = () => {
        setConfirmId(null)
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-16 text-(--muted-foreground)">
                <p className="text-4xl mb-3">💸</p>
                <p className="text-sm font-medium">{t("noTransactions")}</p>
                <p className="text-xs mt-1">{t("noTransactionsDesc")}</p>
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-(--border)">
                            <th className="text-left py-3 px-4 text-(--muted-foreground) font-medium">
                                Title
                            </th>
                            <th className="text-left py-3 px-4 text-(--muted-foreground) font-medium">
                                {t("category")}
                            </th>
                            <th className="text-left py-3 px-4 text-(--muted-foreground) font-medium">
                                {t("date")}
                            </th>
                            <th className="text-right py-3 px-4 text-(--muted-foreground) font-medium">
                                {t("amount")}
                            </th>
                            <th className="text-right py-3 px-4 text-(--muted-foreground) font-medium">
                                {t("actions")}
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
                                    className="border-b border-(--border) hover:bg-(--secondary) transition-colors"
                                >
                                    {/* Title */}
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${tx.type === "income" ? "bg-emerald-500" : "bg-red-500"
                                                    }`}
                                            />
                                            <span className="font-medium text-(--foreground) truncate max-w-[180px]">
                                                {tx.title}
                                            </span>
                                            {tx.isRecurring && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-(--accent) text-white">
                                                    {t("recurringBadge")}
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
                                                <span
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: "#71717a" }}
                                                />
                                            )}
                                            <span className="text-(--muted-foreground)">{tx.category}</span>
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td className="py-3.5 px-4 text-(--muted-foreground)">
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
                                                className="p-1.5 rounded-lg hover:bg-(--secondary) text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(tx._id)}
                                                disabled={deleting && confirmId === tx._id}
                                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-(--muted-foreground) hover:text-red-500 transition-colors disabled:opacity-50"
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

            {/* Confirm Delete Modal */}
            <ConfirmModal
                open={!!confirmId}
                title={t("deleteConfirmTitle")}
                message={t("deleteConfirm")}
                loading={deleting}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    )
}