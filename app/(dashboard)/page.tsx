"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
} from "lucide-react"
import { getMonthlySummary, 
    MonthlySummary } from "@/lib/actions/summary.actions"
import StatCard from "@/components/dashboard/StatsCard"
import { formatCurrency } from "@/lib/utils"
import SpendingChart from "@/components/dashboard/SpendingChart"
import CategoryPieChart from "@/components/dashboard/CategoryPieChart"
import RecentTransactions from "@/components/dashboard/RecentTransactions"
import { useUserPreferences } from "@/hooks/useUserPrerences"

export default function OverviewPage() {
    const { data: session } = useSession()
    const t = useTranslations("dashboard")
    const user = session?.user
 const { currency } = useUserPreferences()

    const [summary, setSummary] = useState<MonthlySummary | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                const result = await getMonthlySummary()
                if (result.success && result.data) {
                    setSummary(result.data)
                }
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return t("goodMorning")
        if (hour < 17) return t("goodAfternoon")
        return t("goodEvening")
    }

    if (loading) {
        return (
            <div className="py-6 space-y-6">
                <div className="h-8 w-64 bg-(--secondary) rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-(--secondary) rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-(--secondary) rounded-xl animate-pulse" />
                    <div className="h-80 bg-(--secondary) rounded-xl animate-pulse" />
                </div>
            </div>
        )
    }

    return (
        <div className="py-6 space-y-6">

            {/* Greeting */}
            <div>
                <h2 className="text-2xl font-bold text-(--foreground)">
                    {getGreeting()}, {user?.name?.split(" ")[0]} 👋
                </h2>
                <p className="text-(--muted-foreground) mt-1 text-sm">
                    {t("overview")}
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title={t("totalIncome")}
                    value={formatCurrency(summary?.totalIncome ?? 0, currency)}
                    subtitle={t("thisMonth")}
                    icon={TrendingUp}
                    iconColor="#10b981"
                    iconBg="#10b98120"
                    trend="neutral"
                />
                <StatCard
                    title={t("totalExpenses")}
                    value={formatCurrency(summary?.totalExpenses ?? 0, currency)}
                    subtitle={t("thisMonth")}
                    icon={TrendingDown}
                    iconColor="#ef4444"
                    iconBg="#ef444420"
                    trend="neutral"
                />
                <StatCard
                    title={t("netBalance")}
                    value={formatCurrency(summary?.netBalance ?? 0, currency)}
                    subtitle={t("thisMonth")}
                    icon={Wallet}
                    iconColor="#6366f1"
                    iconBg="#6366f120"
                    trend={
                        (summary?.netBalance ?? 0) >= 0 ? "up" : "down"
                    }
                />
                <StatCard
                    title={t("savingsRate")}
                    value={`${summary?.savingsRate ?? 0}%`}
                    subtitle={t("ofIncomeSaved")}
                    icon={PiggyBank}
                    iconColor="#f59e0b"
                    iconBg="#f59e0b20"
                    trend={
                        (summary?.savingsRate ?? 0) >= 20 ? "up" : "down"
                    }
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendingChart
                    data={summary?.monthlyTrend ?? []}
                    currency={currency}
                />
                <CategoryPieChart
                    data={summary?.categoryBreakdown ?? []}
                    currency={currency}
                />
            </div>

            {/* Recent Transactions */}
            <RecentTransactions
                transactions={summary?.recentTransactions ?? []}
                currency={currency}
            />

        </div>
    )
}