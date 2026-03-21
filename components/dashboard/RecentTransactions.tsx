"use client"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { getCategoryMeta } from "@/constants/categories"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { TransactionData } from "@/types"
import { useUserPreferences } from "@/hooks/useUserPreferences"

interface Props {
    transactions: TransactionData[]
    currency: string
}

export default function RecentTransactions({ transactions }: Props) {
    const t = useTranslations("dashboard")
    const tTransactions = useTranslations("transactions")
    const { currency, dateFormat } = useUserPreferences()

    return (
        <div className="bg-(--card) rounded-xl border border-(--border) p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-(--foreground)">
                    {t("recentTransactions")}
                </h3>
                <Link
                    href="/transactions"
                    className="text-sm text-(--primary) hover:underline font-medium"
                >
                    {t("viewAll")}
                </Link>
            </div>

            {transactions.length === 0 ? (
                <div className="text-center py-8 text-(--muted-foreground) text-sm">
                    <p className="text-3xl mb-2">💸</p>
                    <p>{tTransactions("noTransactions")}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {transactions.map((tx) => {
                        const meta = getCategoryMeta(tx.category)
                        const Icon = meta?.icon

                        return (
                            <div
                                key={tx._id}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Category Icon */}
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            backgroundColor: meta?.color
                                                ? `${meta.color}20`
                                                : "var(--secondary)",
                                        }}
                                    >
                                        {Icon ? (
                                            <Icon size={16} style={{ color: meta?.color }} />
                                        ) : (
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: "#71717a" }}
                                            />
                                        )}
                                    </div>

                                    {/* Title + Date */}
                                    <div>
                                        <p className="text-sm font-medium text-(--foreground) truncate max-w-40">
                                            {tx.title}
                                        </p>
                                        <p className="text-xs text-(--muted-foreground)">
                                            {formatDate(tx.date, dateFormat)}
                                        </p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <p
                                    className={`text-sm font-semibold ${tx.type === "income" ? "text-emerald-500" : "text-red-500"
                                        }`}
                                >
                                    {tx.type === "income" ? "+" : "-"}
                                    {formatCurrency(tx.amount, currency)}
                                </p>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}