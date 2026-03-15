"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Download } from "lucide-react"
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
} from "lucide-react"
import { getReportsData, getTransactionsForExport, ReportPeriod, ReportsData } from "@/lib/actions/report.actions"
import StatCard from "@/components/dashboard/StatsCard"
import { formatCurrency } from "@/lib/utils"
import SpendingChart from "@/components/dashboard/SpendingChart"
import CategoryPieChart from "@/components/dashboard/CategoryPieChart"
import SavingsTrendChart from "@/components/reports/SavingsTrendChart"
import TopCategories from "@/components/reports/TopCategories"

export default function ReportsPage() {
    const { data: session } = useSession()
    const currency = (session?.user as any)?.currency ?? "NGN"
    const t = useTranslations("reports")
    const tDashboard = useTranslations("dashboard")

    const [period, setPeriod] = useState<ReportPeriod>("6months")
    const [data, setData] = useState<ReportsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                const result = await getReportsData(period)
                if (result.success && result.data) {
                    setData(result.data)
                }
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [period])

    const handleExport = async () => {
        setExporting(true)
        const result = await getTransactionsForExport()
        setExporting(false)

        if (!result.success || !result.data) return

        // Create and trigger download
        const blob = new Blob([result.data], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `spendwise-transactions-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const PERIODS: { value: ReportPeriod; label: string }[] = [
        { value: "month", label: t("thisMonth") },
        { value: "3months", label: t("last3Months") },
        { value: "6months", label: t("last6Months") },
        { value: "year", label: t("thisYear") },
    ]

    if (loading) {
        return (
            <div className="py-6 space-y-6">
                <div className="h-8 w-48 bg-(--secondary) rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-(--secondary) rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-80 bg-(--secondary) rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="py-6 space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-(--foreground)">{t("title")}</h2>

                <div className="flex items-center flex-wrap gap-3">
                    {/* Period Selector */}
                    <div className="flex rounded-lg border border-(--border) overflow-hidden">
                        {PERIODS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`px-3 py-2 text-xs font-medium transition-colors ${period === p.value
                                        ? "bg-(--primary) text-white"
                                        : "text-(--muted-foreground) hover:bg-(--secondary)"
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) text-(--foreground) text-sm font-medium hover:bg-(--secondary) transition-colors disabled:opacity-50"
                    >
                        <Download size={16} />
                        {exporting ? t("exporting") : t("export")}
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title={t("totalIncome")}
                    value={formatCurrency(data?.totalIncome ?? 0, currency)}
                    icon={TrendingUp}
                    iconColor="#10b981"
                    iconBg="#10b98120"
                />
                <StatCard
                    title={t("totalExpenses")}
                    value={formatCurrency(data?.totalExpenses ?? 0, currency)}
                    icon={TrendingDown}
                    iconColor="#ef4444"
                    iconBg="#ef444420"
                />
                <StatCard
                    title={t("totalSavings")}
                    value={formatCurrency(data?.totalSavings ?? 0, currency)}
                    icon={Wallet}
                    iconColor="#6366f1"
                    iconBg="#6366f120"
                    trend={(data?.totalSavings ?? 0) >= 0 ? "up" : "down"}
                />
                <StatCard
                    title={t("savingsRate")}
                    value={`${data?.savingsRate ?? 0}%`}
                    icon={PiggyBank}
                    iconColor="#f59e0b"
                    iconBg="#f59e0b20"
                    trend={(data?.savingsRate ?? 0) >= 20 ? "up" : "down"}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendingChart
                    data={data?.monthlyTrend ?? []}
                    currency={currency}
                />
                <CategoryPieChart
                    data={data?.categoryBreakdown ?? []}
                    currency={currency}
                />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SavingsTrendChart
                    data={data?.monthlyTrend ?? []}
                    currency={currency}
                />
                <TopCategories
                    data={data?.topCategories ?? []}
                    currency={currency}
                    totalExpenses={data?.totalExpenses ?? 0}
                />
            </div>

        </div>
    )
}