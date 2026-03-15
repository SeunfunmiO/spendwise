"use client"
import { Pencil, Trash2, AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"
import type { BudgetData } from "@/types"
import { getCategoryMeta } from "@/constants/categories"
import { formatCurrency } from "@/lib/utils"

interface Props {
    budget: BudgetData
    currency: string
    onEdit: (budget: BudgetData) => void
    onDelete: (id: string) => void
}

export default function BudgetCard({ budget, currency, onEdit, onDelete }: Props) {
    const t = useTranslations("budgets")
    const meta = getCategoryMeta(budget.category)
    const Icon = meta?.icon

    const progressColor = budget.isOverBudget
        ? "#ef4444"
        : budget.percentUsed >= 80
            ? "#f59e0b"
            : "#10b981"

    return (
        <div className={`bg-(--card) rounded-xl border p-5 space-y-4 ${budget.isOverBudget
                ? "border-red-300 dark:border-red-800"
                : "border-(--border)"
            }`}>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {/* Category Icon */}
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                            backgroundColor: meta?.color ? `${meta.color}20` : "var(--secondary)",
                        }}
                    >
                        {Icon ? (
                            <Icon size={18} style={{ color: meta?.color }} />
                        ) : (
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: "#71717a" }}
                            />
                        )}
                    </div>

                    {/* Category + Period */}
                    <div>
                        <p className="text-sm font-semibold text-(--foreground)">
                            {budget.category}
                        </p>
                        <p className="text-xs text-(--muted-foreground) capitalize">
                            {t(budget.period)}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(budget)}
                        className="p-1.5 rounded-lg hover:bg-(--secondary) text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(budget._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-(--muted-foreground) hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-(--muted-foreground)">
                        {formatCurrency(budget.spent, currency)} {t("of")} {formatCurrency(budget.limit, currency)}
                    </span>
                    <span
                        className="font-semibold"
                        style={{ color: progressColor }}
                    >
                        {budget.percentUsed}% {t("percentUsed")}
                    </span>
                </div>

                {/* Bar */}
                <div className="w-full h-2 bg-(--secondary) rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.min(budget.percentUsed, 100)}%`,
                            backgroundColor: progressColor,
                        }}
                    />
                </div>
            </div>

            {/* Spent / Remaining */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-(--secondary) rounded-lg p-3">
                    <p className="text-xs text-(--muted-foreground) mb-1">{t("spent")}</p>
                    <p className="text-sm font-semibold text-red-500">
                        {formatCurrency(budget.spent, currency)}
                    </p>
                </div>
                <div className="bg-(--secondary) rounded-lg p-3">
                    <p className="text-xs text-(--muted-foreground) mb-1">{t("remaining")}</p>
                    <p
                        className="text-sm font-semibold"
                        style={{ color: progressColor }}
                    >
                        {budget.remaining < 0
                            ? `-${formatCurrency(Math.abs(budget.remaining), currency)}`
                            : formatCurrency(budget.remaining, currency)}
                    </p>
                </div>
            </div>

            {/* Over Budget Alert */}
            {budget.isOverBudget && (
                <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
                    <AlertTriangle size={12} />
                    {t("overBudget")}
                </div>
            )}

        </div>
    )
}