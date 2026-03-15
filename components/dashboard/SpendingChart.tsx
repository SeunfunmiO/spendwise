"use client"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { useTranslations } from "next-intl"

interface Props {
    data: { month: string; income: number; expenses: number }[]
    currency: string
}

export default function SpendingChart({ data, currency }: Props) {
    const t = useTranslations("dashboard")

    return (
        <div className="bg-(--card) rounded-xl border border-(--border) p-6">
            <h3 className="text-base font-semibold text-(--foreground) mb-6">
                {t("incomeVsExpenses")}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} barGap={4}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) =>
                            new Intl.NumberFormat("en", {
                                notation: "compact",
                                currency,
                            }).format(v)
                        }
                    />
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
                        wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }}
                    />
                    <Bar
                        dataKey="income"
                        name={t("income")}
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="expenses"
                        name={t("expenses")}
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}