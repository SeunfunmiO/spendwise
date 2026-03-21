"use client"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Check, Sparkles, Zap } from "lucide-react"
import { useSession } from "next-auth/react"
import { getUserPlan, verifyPaystackPayment } from "@/lib/actions/upgrade.actions"

declare global {
    interface Window {
        PaystackPop: any
    }
}

export default function UpgradePage() {
    const t = useTranslations("upgrade")
    const { data: session } = useSession()
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
    const [processing, setProcessing] = useState(false)
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState<"success" | "error">("success")
    const [currentPlan, setCurrentPlan] = useState<string>("free")
    const [loadingPlan, setLoadingPlan] = useState(true)

    useEffect(() => {
        // Load Paystack inline script
        const script = document.createElement("script")
        script.src = "https://js.paystack.co/v1/inline.js"
        script.async = true
        document.body.appendChild(script)

        // Fetch current plan
        const fetchPlan = async () => {
            const result = await getUserPlan()
            if (result.success && result.data) {
                setCurrentPlan(result.data.plan)
            }
            setLoadingPlan(false)
        }
        fetchPlan()

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    const MONTHLY_PRICE = 2000
    const ANNUAL_PRICE = 18000

    const FREE_FEATURES = t.raw("freeFeatures") as string[]
    const PREMIUM_FEATURES = t.raw("premiumFeatures") as string[]

    const handleUpgrade = () => {
        if (!session?.user?.email) return
        setProcessing(true)
        setMessage("")

        const planCode = billingCycle === "monthly"
            ? process.env.NEXT_PUBLIC_PAYSTACK_MONTHLY_PLAN
            : process.env.NEXT_PUBLIC_PAYSTACK_ANNUAL_PLAN

        const amount = billingCycle === "monthly"
            ? MONTHLY_PRICE * 100 // Paystack uses kobo
            : ANNUAL_PRICE * 100

        const handler = window.PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
            email: session.user.email,
            amount,
            currency: "NGN",
            plan: planCode,
            ref: `spendwise_${Date.now()}`,
            callback: async (response: any) => {
                const result = await verifyPaystackPayment(response.reference)
                setProcessing(false)
                if (result.success) {
                    setCurrentPlan("premium")
                    setMessageType("success")
                    setMessage(t("paymentSuccess"))
                } else {
                    setMessageType("error")
                    setMessage(t("paymentFailed"))
                }
            },
            onClose: () => {
                setProcessing(false)
            },
        })

        handler.openIframe()
    }

    if (loadingPlan) {
        return (
            <div className="py-6 space-y-6">
                <div className="h-8 w-64 bg-(--secondary) rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    <div className="h-96 bg-(--secondary) rounded-xl animate-pulse" />
                    <div className="h-96 bg-(--secondary) rounded-xl animate-pulse" />
                </div>
            </div>
        )
    }

    return (
        <div className="py-6 space-y-8 max-w-4xl">

            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-(--foreground)">{t("title")}</h2>
                <p className="text-(--muted-foreground) text-sm">{t("subtitle")}</p>
            </div>

            {/* Already Premium */}
            {currentPlan === "premium" && (
                <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center">
                    <Sparkles size={32} className="text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                        {t("alreadyPremium")}
                    </h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {t("alreadyPremiumDesc")}
                    </p>
                </div>
            )}

            {/* Billing Toggle */}
            {currentPlan === "free" && (
                <>
                    <div className="flex justify-center">
                        <div className="flex rounded-lg border border-(--border) overflow-hidden">
                            <button
                                onClick={() => setBillingCycle("monthly")}
                                className={`px-6 py-2.5 text-sm font-medium transition-colors ${billingCycle === "monthly"
                                        ? "bg-(--primary) text-white"
                                        : "text-(--muted-foreground) hover:bg-(--secondary)"
                                    }`}
                            >
                                {t("monthly")}
                            </button>
                            <button
                                onClick={() => setBillingCycle("annual")}
                                className={`px-6 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${billingCycle === "annual"
                                        ? "bg-(--primary) text-white"
                                        : "text-(--muted-foreground) hover:bg-(--secondary)"
                                    }`}
                            >
                                {t("annual")}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${billingCycle === "annual"
                                        ? "bg-white text-(--primary)"
                                        : "bg-emerald-100 text-emerald-700"
                                    }`}>
                                    {t("savePercent")}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Plans */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Free Plan */}
                        <div className="bg-(--card) rounded-xl border border-(--border) p-6 space-y-6">
                            <div>
                                <p className="text-sm font-medium text-(--muted-foreground) mb-1">
                                    {t("freePlanTitle")}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-(--foreground)">₦0</span>
                                    <span className="text-(--muted-foreground) text-sm">{t("perMonth")}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {FREE_FEATURES.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-(--secondary) flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-(--muted-foreground)" />
                                        </div>
                                        <span className="text-sm text-(--muted-foreground)">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled
                                className="w-full py-2.5 rounded-lg border border-(--border) text-sm font-medium text-(--muted-foreground) cursor-not-allowed opacity-50"
                            >
                                {t("currentPlan")}
                            </button>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-(--card) rounded-xl border-2 border-(--primary) p-6 space-y-6 relative">
                            {/* Most Popular Badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-(--primary) text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                    <Zap size={10} />
                                    {t("mostPopular")}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-(--muted-foreground) mb-1">
                                    {t("premiumPlanTitle")}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-(--foreground)">
                                        {billingCycle === "monthly" ? "₦2,000" : "₦18,000"}
                                    </span>
                                    <span className="text-(--muted-foreground) text-sm">
                                        {billingCycle === "monthly" ? t("perMonth") : t("perYear")}
                                    </span>
                                </div>
                                {billingCycle === "annual" && (
                                    <p className="text-xs text-emerald-500 mt-1">
                                        ₦1,500{t("perMonth")} · {t("savePercent")}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                {PREMIUM_FEATURES.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-emerald-500" />
                                        </div>
                                        <span className="text-sm text-(--foreground)">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Message */}
                            {message && (
                                <p className={`text-sm px-3 py-2 rounded-lg ${messageType === "success"
                                        ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                                        : "text-red-500 bg-red-50 dark:bg-red-950"
                                    }`}>
                                    {message}
                                </p>
                            )}

                            <button
                                onClick={handleUpgrade}
                                disabled={processing}
                                className="w-full py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    t("processing")
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        {t("upgradeNow")}
                                    </>
                                )}
                            </button>

                        </div>
                    </div>

                    {/* Features comparison */}
                    <div className="text-center">
                        <p className="text-sm text-(--muted-foreground)">{t("featuresTitle")}</p>
                    </div>
                </>
            )}

        </div>
    )
}