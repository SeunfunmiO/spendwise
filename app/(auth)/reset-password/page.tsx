"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Eye, EyeOff, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/schemas"
import { resetPassword, verifyResetToken } from "@/lib/actions/password.actions"

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token") ?? ""

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

    // Verify token on page load
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

        // Redirect to login after 2 seconds
        setTimeout(() => router.push("/login"), 2000)
    }

    return (
        <div className="w-full max-w-md">
            <div className="bg-(--card) rounded-2xl border border-(--border) shadow-sm px-8 py-10">

                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <Image src="/logo.svg" alt="SpendWise" width={160} height={36} priority />
                </div>

                {/* Loading state */}
                {tokenValid === null && (
                    <div className="text-center text-(--muted-foreground) text-sm py-8">
                        Verifying reset link...
                    </div>
                )}

                {/* Invalid token */}
                {tokenValid === false && (
                    <div className="text-center">
                        <div className="text-5xl mb-4"><X color="red" size={14} /></div>
                        <h1 className="text-2xl font-bold text-(--foreground) mb-2">
                            Link expired
                        </h1>
                        <p className="text-sm text-(--muted-foreground) mb-6">
                            {tokenError}
                        </p>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-(--primary)` font-medium hover:underline"
                        >
                            Request a new reset link
                        </Link>
                    </div>
                )}

                {/* Success state */}
                {success && (
                    <div className="text-center">
                        <div className="text-5xl mb-4"><CheckCircle color="green" size={14}/></div>
                        <h1 className="text-2xl font-bold text-(--foreground) mb-2">
                            Password reset!
                        </h1>
                        <p className="text-sm text-(--muted-foreground)">
                            Redirecting you to sign in...
                        </p>
                    </div>
                )}

                {/* Reset form */}
                {tokenValid === true && !success && (
                    <>
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-(--foreground)">
                                Reset your password
                            </h1>
                            <p className="text-sm text-(--muted-foreground) mt-1">
                                Enter your new password below.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* New Password */}
                            <div>
                                <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        {...register("password")}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 8 chars, uppercase, number & special"
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
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        {...register("confirmPassword")}
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Repeat your new password"
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
                                {isSubmitting ? "Resetting..." : "Reset Password"}
                            </button>

                        </form>
                    </>
                )}

            </div>
        </div>
    )
}