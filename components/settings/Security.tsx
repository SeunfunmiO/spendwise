"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, CheckCircle, Lock } from "lucide-react"
import { changePassword } from "@/lib/actions/settings.actions"
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/schemas"

export default function SecurityTab() {
    const { data: session } = useSession()
    const t = useTranslations("settings")
    const user = session?.user
    const isGoogleUser = !!(user as any)?.image && !(user as any)?.password

    const [showCurrentPw, setShowCurrentPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)
    const [showConfirmPw, setShowConfirmPw] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
    })

    const onSubmit = async (data: ChangePasswordInput) => {
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
        reset()
        setTimeout(() => setPasswordSuccess(""), 3000)
    }

    return (
        <div className="bg-(--card) rounded-xl border border-(--border) p-6">
            {isGoogleUser ? (
                <div className="text-center py-8 text-(--muted-foreground) flex flex-col items-center gap-3">
                    <Lock size={32} className="text-(--muted-foreground)" />
                    <p className="text-sm">{t("googleAccount")}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    {/* Current Password */}
                    <div>
                        <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                            {t("currentPassword")}
                        </label>
                        <div className="relative">
                            <input
                                {...register("currentPassword")}
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
                        {errors.currentPassword && (
                            <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                            {t("newPassword")}
                        </label>
                        <div className="relative">
                            <input
                                {...register("newPassword")}
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
                        {errors.newPassword && (
                            <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                            {t("confirmNewPassword")}
                        </label>
                        <div className="relative">
                            <input
                                {...register("confirmPassword")}
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
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Error / Success */}
                    {passwordError && (
                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
                            {passwordError}
                        </p>
                    )}
                    {passwordSuccess && (
                        <p className="text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3 py-2 rounded-lg flex gap-2 items-center">
                            <CheckCircle size={12} /> {passwordSuccess}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isSubmitting ? t("changingPassword") : t("changePassword")}
                    </button>

                </form>
            )}
        </div>
    )
}