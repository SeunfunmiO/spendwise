"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { CheckCircle } from "lucide-react"
import { getUserProfile, refreshSession, updatePreferences } from "@/lib/actions/settings.actions"
import { setLocale } from "@/lib/actions/locale.actions"
import type { Locale } from "@/i18n/config"

const CURRENCIES = [
    { value: "NGN", label: "Nigerian Naira (₦)" },
    { value: "USD", label: "US Dollar ($)" },
    { value: "GBP", label: "British Pound (£)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GHS", label: "Ghanaian Cedi (₵)" },
    { value: "KES", label: "Kenyan Shilling (KSh)" },
]

const LANGUAGES = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "ar", label: "العربية" },
    { value: "pt", label: "Português" },
]

const DATE_FORMATS = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "YYYY/MM/DD", label: "YYYY/MM/DD" },
]

export default function PreferencesTab() {
    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(true)
    const { theme, setTheme } = useTheme()
    const t = useTranslations("settings")
    const user = session?.user

    const userCurrency = (user as any)?.currency
    const userLanguage = (user as any)?.language
    const userDateFormat = (user as any)?.dateFormat
    const userBudgetAlerts = (user as any)?.budgetAlerts

    const [prefCurrency, setPrefCurrency] = useState("NGN")
    const [prefLanguage, setPrefLanguage] = useState("en")
    const [prefDateFormat, setPrefDateFormat] = useState("DD/MM/YYYY")
    const [prefBudgetAlerts, setPrefBudgetAlerts] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState("")



    // Replace useEffect with DB fetch
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true)
            const result = await getUserProfile()
            if (result.success && result.data) {
                setPrefCurrency(result.data.currency)
                setPrefLanguage(result.data.language)
                setPrefDateFormat(result.data.dateFormat)
                setPrefBudgetAlerts(result.data.budgetAlerts)
            }
            setLoading(false)
        }
        fetchProfile()
    }, [])

    // Update onSubmit — remove update() and reload, just re-fetch
    const onSubmit = async () => {
        setSaving(true)
        setSuccess("")

        const result = await updatePreferences({
            currency: prefCurrency,
            language: prefLanguage,
            dateFormat: prefDateFormat,
            budgetAlerts: prefBudgetAlerts,
        })

        if (result.success) {
            await setLocale(prefLanguage as Locale)
            // Re-fetch from DB to confirm saved values
            const updated = await getUserProfile()
            if (updated.success && updated.data) {
                setPrefCurrency(updated.data.currency)
                setPrefLanguage(updated.data.language)
                setPrefDateFormat(updated.data.dateFormat)
                setPrefBudgetAlerts(updated.data.budgetAlerts)
            }
            setSuccess(t("preferencesUpdated"))
            setTimeout(() => setSuccess(""), 3000)
        }

        setSaving(false)
    }

    return (
        <div className="bg-(--card) rounded-xl border border-(--border) p-6 space-y-6">

            {/* Currency */}
            <div>
                <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                    {t("currency")}
                </label>
                <select
                    value={prefCurrency}
                    onChange={(e) => setPrefCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                >
                    {CURRENCIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
            </div>

            {/* Language */}
            <div>
                <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                    {t("language")}
                </label>
                <select
                    value={prefLanguage}
                    onChange={(e) => setPrefLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                >
                    {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                </select>
            </div>

            {/* Date Format */}
            <div>
                <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                    {t("dateFormat")}
                </label>
                <select
                    value={prefDateFormat}
                    onChange={(e) => setPrefDateFormat(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                >
                    {DATE_FORMATS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                </select>
            </div>

            {/* Theme */}
            <div>
                <label className="text-sm font-medium text-(--foreground) mb-2 block">
                    {t("theme")}
                </label>
                <div className="flex rounded-lg border border-(--border) overflow-hidden w-fit">
                    {(["light", "dark", "system"] as const).map((th) => (
                        <button
                            key={th}
                            type="button"
                            onClick={() => setTheme(th)}
                            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${theme === th
                                    ? "bg-(--primary) text-white"
                                    : "text-(--muted-foreground) hover:bg-(--secondary)"
                                }`}
                        >
                            {t(th)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Budget Alerts */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-(--foreground)">{t("budgetAlerts")}</p>
                    <p className="text-xs text-(--muted-foreground) mt-0.5">{t("budgetAlertsDesc")}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setPrefBudgetAlerts(!prefBudgetAlerts)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${prefBudgetAlerts ? "bg-(--primary)" : "bg-(--secondary)"
                        }`}
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefBudgetAlerts ? "translate-x-5" : "translate-x-0"
                            }`}
                    />
                </button>
            </div>

            {/* Success */}
            {success && (
                <p className="text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3 py-2 rounded-lg flex gap-2 items-center">
                    <CheckCircle size={12} /> {success}
                </p>
            )}

            <button
                onClick={onSubmit}
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {saving ? t("savingPreferences") : t("savePreferences")}
            </button>

        </div>
    )
}