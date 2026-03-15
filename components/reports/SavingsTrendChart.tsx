"use client"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts"
import { useTranslations } from "next-intl"

interface Props {
    data: { month: string; savings: number }[]
    currency: string
}

export default function SavingsTrendChart({ data, currency }: Props) {
    const t = useTranslations("reports")

    return (
        <div className="bg-(--card) rounded-xl border border-(--border) p-6">
            <h3 className="text-base font-semibold text-(--foreground) mb-6">
                {t("savingsTrend")}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data}>
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
                            new Intl.NumberFormat("en", { notation: "compact" }).format(v)
                        }
                    />
                    <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 4" />
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
                    <Line
                        type="monotone"
                        dataKey="savings"
                        name={t("netSavings")}
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ fill: "#6366f1", r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}