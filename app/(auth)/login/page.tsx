"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { loginUser } from "@/lib/actions/auth.actions"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get("registered") === "true"
  const t = useTranslations("auth")

  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setError("")

    if (!form.email || !form.password) {
      setError(t("email") + " " + t("password") + " are required")
      return
    }

    setLoading(true)

    const result = await loginUser({
      email: form.email,
      password: form.password,
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    router.push("/")
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-(--card) rounded-2xl border border-(--border) shadow-sm px-8 py-10">

        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Image src="/logo.svg" alt="SpendWise" width={160} height={36} priority />
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-(--foreground)">
            {t("welcomeBack")}
          </h1>
          <p className="text-sm text-(--muted-foreground) mt-1">
            {t("signInAccount")}
          </p>
        </div>

        {/* Just registered banner */}
        {justRegistered && (
          <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 px-3 py-2 rounded-lg">
            <CheckCircle color="green" size={14} /> {t("accountCreated")}
          </div>
        )}

        <div className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
              {t("email")}
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-(--foreground)">
                {t("password")}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-(--primary) hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordMin")}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? t("signingIn") : t("login")}
          </button>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-(--border)" />
            </div>
            <div className="relative flex justify-center text-xs text-(--muted-foreground)">
              <span className="bg-(--card) px-2">{t("orContinueWith")}</span>
            </div>
          </div>

          <GoogleButton label={t("continueWithGoogle")} redirecting={t("redirecting")} />

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-(--muted-foreground) mt-6">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-(--primary) font-medium hover:underline">
            {t("signUp")}
          </Link>
        </p>

      </div>
    </div>
  )
}

// ---- Google Button ----
function GoogleButton({ label, redirecting }: { label: string; redirecting: string }) {
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setLoading(true)
    const { signIn } = await import("next-auth/react")
    await signIn("google", { callbackUrl: "/" })
  }

  return (
    <button
      onClick={handleGoogle}
      disabled={loading}
      className="w-full py-2.5 rounded-lg border border-(--border) bg-(--card) text-(--foreground) text-sm font-medium hover:bg-(--secondary) transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        <path fill="none" d="M0 0h48v48H0z" />
      </svg>
      {loading ? redirecting : label}
    </button>
  )
}