"use client"
import { useTranslations } from "next-intl"
import { formatCurrency } from "@/lib/utils"

interface Props {
    data: { category: string; amount: number; color: string; count: number }[]
    currency: string
    totalExpenses: number
}

export default function TopCategories({ data, currency, totalExpenses }: Props) {
    const t = useTranslations("reports")

    return (
        <div className="bg-(--card) rounded-xl border border-(--border) p-6">
            <h3 className="text-base font-semibold text-(--foreground) mb-6">
                {t("topCategories")}
            </h3>

            {data.length === 0 ? (
                <div className="text-center py-8 text-(--muted-foreground) text-sm">
                    {t("noData")}
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((item, index) => {
                        const percentage = totalExpenses > 0
                            ? Math.round((item.amount / totalExpenses) * 100)
                            : 0

                        return (
                            <div key={item.category} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="font-medium text-(--foreground)">
                                            {item.category}
                                        </span>
                                        <span className="text-xs text-(--muted-foreground)">
                                            ({item.count} {item.count === 1 ? t("transaction") : t("transactions")})
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-(--foreground)">
                                            {formatCurrency(item.amount, currency)}
                                        </span>
                                        <span className="text-xs text-(--muted-foreground) ml-2">
                                            {percentage}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-(--secondary) rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}