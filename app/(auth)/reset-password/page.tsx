"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Eye, EyeOff, XCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/schemas"
import { resetPassword, verifyResetToken } from "@/lib/actions/password.actions"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const t = useTranslations("auth")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [tokenError, setTokenError] = useState("")
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setTokenValid(false)
        setTokenError("No reset token found. Please request a new reset link.")
        return
      }
      const result = await verifyResetToken(token)
      if (!result.success) {
        setTokenValid(false)
        setTokenError(result.error ?? "Invalid or expired reset link.")
      } else {
        setTokenValid(true)
      }
    }
    verify()
  }, [token])

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError("")
    const result = await resetPassword(token, data.password)
    if (!result.success) {
      setServerError(result.error ?? "")
      return
    }
    setSuccess(true)
    setTimeout(() => router.push("/login"), 2000)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-(--card) rounded-2xl border border-(--border) shadow-sm px-8 py-10">

        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Image src="/logo.svg" alt="SpendWise" width={160} height={36} priority />
        </div>

        {/* Loading */}
        {tokenValid === null && (
          <div className="text-center text-(--muted-foreground) text-sm py-8">
            <div className="w-8 h-8 border-2 border-(--primary) border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            {t("verifyingLink")}
          </div>
        )}

        {/* Invalid token */}
        {tokenValid === false && (
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-(--foreground)">
              {t("linkExpired")}
            </h1>
            <p className="text-sm text-(--muted-foreground)">
              {tokenError}
            </p>
            <Link
              href="/forgot-password"
              className="text-sm text-(--primary) font-medium hover:underline"
            >
              {t("requestNewLink")}
            </Link>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-(--foreground)">
              {t("passwordResetSuccess")}
            </h1>
            <p className="text-sm text-(--muted-foreground)">
              {t("passwordResetRedirect")}
            </p>
          </div>
        )}

        {/* Reset form */}
        {tokenValid === true && !success && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-(--foreground)">
                {t("resetPassword")}
              </h1>
              <p className="text-sm text-(--muted-foreground) mt-1">
                {t("resetPasswordDesc")}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* New Password */}
              <div>
                <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                  {t("newPassword")}
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordMin")}
                    className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
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
                    type={showConfirm ? "text" : "password"}
                    placeholder={t("repeatPassword")}
                    className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? t("resetting") : t("resetPasswordBtn")}
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  )
}