"use client"
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { useTranslations } from "next-intl"

interface Props {
    data: { category: string; amount: number; color: string }[]
    currency: string
}

export default function CategoryPieChart({ data, currency }: Props) {
    const t = useTranslations("dashboard")

    if (data.length === 0) {
        return (
            <div className="bg-(--card) rounded-xl border border-(--border) p-6">
                <h3 className="text-base font-semibold text-(--foreground) mb-6">
                    {t("spendingByCategory")}
                </h3>
                <div className="flex items-center justify-center h-48 text-(--muted-foreground) text-sm">
                    {t("noExpensesYet")}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-(--card) rounded-xl border border-(--border) p-6">
            <h3 className="text-base font-semibold text-(--foreground) mb-6">
                {t("spendingByCategory")}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="amount"
                        nameKey="category"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "13px",
                        }}
                        formatter={(value) =>
                            typeof value === "number"
                                ? new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency,
                                }).format(value)
                                : value
                        }
                    />
                    <Legend
                        wrapperStyle={{ fontSize: "12px" }}
                        formatter={(value) => (
                            <span style={{ color: "var(--foreground)" }}>{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}