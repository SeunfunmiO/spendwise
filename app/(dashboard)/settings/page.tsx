"use client"
import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Camera, LogOut, Trash2, CheckCircle, Lock } from "lucide-react"
import Image from "next/image"
import {
    updateProfile,
    changePassword,
    updatePreferences,
    deleteAccount,
} from "@/lib/actions/settings.actions"
import { logoutUser } from "@/lib/actions/auth.actions"
import {
    updateProfileSchema,
    changePasswordSchema,
    type UpdateProfileInput,
    type ChangePasswordInput,
} from "@/lib/schemas"
import ConfirmModal from "@/components/ui/ConfirmModal"
import type { Locale } from "@/i18n/config"
import { setLocale } from "@/lib/actions/locale.actions"

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

type Tab = "profile" | "security" | "preferences"

export default function SettingsPage() {
    const { data: session, update } = useSession()
    const { theme, setTheme } = useTheme()
    const t = useTranslations("settings")
    const user = session?.user
    const isGoogleUser = !!(user as any)?.image && !(user as any)?.password

    const [activeTab, setActiveTab] = useState<Tab>("profile")
    const [avatarUrl, setAvatarUrl] = useState((user as any)?.image ?? "")
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [profileSuccess, setProfileSuccess] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")
    const [preferencesSuccess, setPreferencesSuccess] = useState("")
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const currency = (user as any)?.currency ?? "NGN"
    const language = (user as any)?.language ?? "en"
    const dateFormat = (user as any)?.dateFormat ?? "DD/MM/YYYY"
    const budgetAlerts = (user as any)?.budgetAlerts ?? true

    const [prefCurrency, setPrefCurrency] = useState(currency)
    const [prefLanguage, setPrefLanguage] = useState(language)
    const [prefDateFormat, setPrefDateFormat] = useState(dateFormat)
    const [prefBudgetAlerts, setPrefBudgetAlerts] = useState(budgetAlerts)
    const [savingPreferences, setSavingPreferences] = useState(false)

    // ---- Profile Form ----
    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    } = useForm<UpdateProfileInput>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: { name: user?.name ?? "" },
    })

    // ---- Password Form ----
    const [showCurrentPw, setShowCurrentPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)
    const [showConfirmPw, setShowConfirmPw] = useState(false)
    const [passwordError, setPasswordError] = useState("")

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    } = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
    })

    // ---- Avatar Upload ----
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingAvatar(true)
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await res.json()
        setUploadingAvatar(false)

        if (data.url) {
            setAvatarUrl(data.url)
        }
    }

    // ---- Profile Submit ----
    const onProfileSubmit = async (data: UpdateProfileInput) => {
        setProfileSuccess("")
        const result = await updateProfile({ name: data.name, image: avatarUrl })
        if (result.success) {
            setProfileSuccess(t("profileUpdated"))
            await update({ name: data.name, image: avatarUrl })
            setTimeout(() => setProfileSuccess(""), 3000)
        }
    }

    // ---- Password Submit ----
    const onPasswordSubmit = async (data: ChangePasswordInput) => {
        setPasswordError("")
        setPasswordSuccess("")
        const result = await changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        })
        if (!result.success) {
            setPasswordError(result.error ?? "")
            return
        }
        setPasswordSuccess(t("passwordChanged"))
        resetPassword()
        setTimeout(() => setPasswordSuccess(""), 3000)
    }

    // ---- Preferences Submit ----
    const onPreferencesSubmit = async () => {
        setSavingPreferences(true)
        setPreferencesSuccess("")

        const result = await updatePreferences({
            currency: prefCurrency,
            language: prefLanguage,
            dateFormat: prefDateFormat,
            budgetAlerts: prefBudgetAlerts,
        })

        if (result.success) {
            // Update locale cookie
            await setLocale(prefLanguage as Locale)
            await update({ currency: prefCurrency, language: prefLanguage })
            setPreferencesSuccess(t("preferencesUpdated"))
            setTimeout(() => setPreferencesSuccess(""), 3000)
        }

        setSavingPreferences(false)
    }

    // ---- Delete Account ----
    const handleDeleteAccount = async () => {
        setDeleting(true)
        const result = await deleteAccount()
        setDeleting(false)
        if (result.success) {
            await logoutUser()
        }
    }

    const TABS: { key: Tab; label: string }[] = [
        { key: "profile", label: t("profile") },
        { key: "security", label: t("security") },
        { key: "preferences", label: t("preferences") },
    ]

    return (
        <div className="py-6 max-w-2xl">

            {/* Header */}
            <h2 className="text-2xl font-bold text-(--foreground) mb-6">{t("title")}</h2>

            {/* Tabs */}
            <div className="flex rounded-lg border border-(--border) overflow-hidden mb-8 w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key
                                ? "bg-(--primary) text-white"
                                : "text-(--muted-foreground) hover:bg-(--secondary)"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ---- PROFILE TAB ---- */}
            {activeTab === "profile" && (
                <div className="space-y-6">
                    <form
                        onSubmit={handleProfileSubmit(onProfileSubmit)}
                        className="bg-(--card) rounded-xl border border-(--border) p-6 space-y-6"
                    >
                        {/* Avatar */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-3 block">
                                {t("avatar")}
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    {avatarUrl ? (
                                        <Image
                                            src={avatarUrl}
                                            alt="Avatar"
                                            width={72}
                                            height={72}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-18 h-18 rounded-full bg-(--primary) flex items-center justify-center text-white text-2xl font-bold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-(--primary) text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                                    >
                                        <Camera size={13} />
                                    </button>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="text-sm text-(--primary) font-medium hover:underline disabled:opacity-50"
                                    >
                                        {uploadingAvatar ? t("uploadingAvatar") : avatarUrl ? t("changeAvatar") : t("uploadAvatar")}
                                    </button>
                                    <p className="text-xs text-(--muted-foreground) mt-1">{t("avatarHint")}</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                {t("name")}
                            </label>
                            <input
                                {...registerProfile("name")}
                                type="text"
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                            />
                            {profileErrors.name && (
                                <p className="text-xs text-red-500 mt-1">{profileErrors.name.message}</p>
                            )}
                        </div>

                        {/* Email — read only */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                {t("email")}
                            </label>
                            <input
                                type="email"
                                value={user?.email ?? ""}
                                disabled
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--secondary) text-(--muted-foreground) cursor-not-allowed"
                            />
                        </div>

                        {/* Success */}
                        {profileSuccess && (
                            <p className="text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3 py-2 rounded-lg">
                                <CheckCircle color="green" size={12}/> {profileSuccess}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={profileSubmitting}
                            className="w-full py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {profileSubmitting ? t("savingProfile") : t("saveProfile")}
                        </button>
                    </form>

                    {/* Logout — mobile friendly */}
                    <div className="bg-(--card) rounded-xl border border-(--border) p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-(--foreground)">{t("logout")}</p>
                                <p className="text-xs text-(--muted-foreground) mt-0.5">{t("logoutDesc")}</p>
                            </div>
                            <form action={logoutUser}>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--secondary) transition-colors"
                                >
                                    <LogOut size={16} />
                                    {t("logout")}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-(--card) rounded-xl border border-red-200 dark:border-red-900 p-6">
                        <h3 className="text-sm font-semibold text-red-500 mb-4">
                            {t("dangerZone")}
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-(--foreground)">{t("deleteAccount")}</p>
                                <p className="text-xs text-(--muted-foreground) mt-0.5">{t("deleteAccountDesc")}</p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                <Trash2 size={16} />
                                {t("deleteAccount")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---- SECURITY TAB ---- */}
            {activeTab === "security" && (
                <div className="bg-(--card) rounded-xl border border-(--border) p-6">
                    {isGoogleUser ? (
                        <div className="text-center py-8 text-(--muted-foreground)">
                            <p className="text-4xl mb-3"><Lock/></p>
                            <p className="text-sm">{t("googleAccount")}</p>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">

                            {/* Current Password */}
                            <div>
                                <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                    {t("currentPassword")}
                                </label>
                                <div className="relative">
                                    <input
                                        {...registerPassword("currentPassword")}
                                        type={showCurrentPw ? "text" : "password"}
                                        className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
                                    >
                                        {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                    {t("newPassword")}
                                </label>
                                <div className="relative">
                                    <input
                                        {...registerPassword("newPassword")}
                                        type={showNewPw ? "text" : "password"}
                                        className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPw(!showNewPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
                                    >
                                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                    {t("confirmNewPassword")}
                                </label>
                                <div className="relative">
                                    <input
                                        {...registerPassword("confirmPassword")}
                                        type={showConfirmPw ? "text" : "password"}
                                        className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
                                    >
                                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>
                                )}
                            </div>

                            {/* Error / Success */}
                            {passwordError && (
                                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
                                    {passwordError}
                                </p>
                            )}
                            {passwordSuccess && (
                                <p className="text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3 py-2 rounded-lg">
                                    <CheckCircle color="green" size={12}/> {passwordSuccess}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={passwordSubmitting}
                                className="w-full py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {passwordSubmitting ? t("changingPassword") : t("changePassword")}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* ---- PREFERENCES TAB ---- */}
            {activeTab === "preferences" && (
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
                    {preferencesSuccess && (
                        <p className="text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3 py-2 rounded-lg">
                            <CheckCircle color="green" size={12}/> {preferencesSuccess}
                        </p>
                    )}

                    <button
                        onClick={onPreferencesSubmit}
                        disabled={savingPreferences}
                        className="w-full py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {savingPreferences ? t("savingPreferences") : t("savePreferences")}
                    </button>
                </div>
            )}

            {/* Delete Account Modal */}
            <ConfirmModal
                open={showDeleteModal}
                title={t("deleteAccountConfirmTitle")}
                message={t("deleteAccountConfirm")}
                confirmLabel={t("deleteAccount")}
                loading={deleting}
                onConfirm={handleDeleteAccount}
                onCancel={() => setShowDeleteModal(false)}
            />

        </div>
    )
}