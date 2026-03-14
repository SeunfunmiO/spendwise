"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterInput } from "@/lib/schemas"
import { registerUser, loginUser } from "@/lib/actions/auth.actions"
import Image from "next/image"

export default function RegisterPage() {
    const router = useRouter()
    const t = useTranslations("auth")

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [serverError, setServerError] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterInput) => {
        setServerError("")

        const result = await registerUser({
            name: data.name,
            email: data.email,
            password: data.password,
        })

        if (!result.success) {
            setServerError(result.error)
            return
        }

        const signInResult = await loginUser({
            email: data.email,
            password: data.password,
        })

        if (!signInResult.success) {
            router.push("/login?registered=true")
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
                        {t("register")}
                    </h1>
                    <p className="text-sm text-(--muted-foreground) mt-1">
                        {t("startTracking")}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                            {t("fullName")}
                        </label>
                        <input
                            {...register("name")}
                            type="text"
                            placeholder="Spend Wise"
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                            {t("email")}
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="you@example.com"
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                            {t("password")}
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
                            {t("confirmPassword")}
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

                    {/* Server Error */}
                    {serverError && (
                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
                            {serverError}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
                    >
                        {isSubmitting ? t("creatingAccount") : t("register")}
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

                </form>

                {/* Footer */}
                <p className="text-center text-sm text-(--muted-foreground) mt-6">
                    {t("hasAccount")}{" "}
                    <Link href="/login" className="text-(--primary) font-medium hover:underline">
                        {t("signIn")}
                    </Link>
                </p>

            </div>
        </div>
    )
}

function GoogleButton({ label, redirecting }: { label: string; redirecting: string }) {
    const [loading, setLoading] = useState(false)

    const handleGoogle = async () => {
        setLoading(true)
        const { signIn } = await import("next-auth/react")
        await signIn("google", { callbackUrl: "/" })
    }

    return (
        <button
            type="button"
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