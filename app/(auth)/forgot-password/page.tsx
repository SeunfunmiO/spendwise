"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/schemas"
import { forgotPassword } from "@/lib/actions/password.actions"
import { MailCheck } from "lucide-react"

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false)
    const [serverError, setServerError] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordInput) => {
        setServerError("")
        const result = await forgotPassword(data.email)

        if (!result.success) {
            setServerError(result.error ?? "")
            return
        }

        setSubmitted(true)
    }

    return (
        <div className="w-full max-w-md">
            <div className="bg-(--card) rounded-2xl border border-(--border) shadow-sm px-8 py-10">

                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <Image src="/logo.svg" alt="SpendWise" width={160} height={36} priority />
                </div>

                {submitted ? (
                    // ---- Success State ----
                    <div className="text-center">
                        <div className="text-5xl mb-4"><MailCheck size={28}/></div>
                        <h1 className="text-2xl font-bold text-(--foreground) mb-2">
                            Check your email
                        </h1>
                        <p className="text-sm text-(--muted-foreground) mb-6">
                            If an account exists with that email, we&apos;ve sent a password reset
                            link. It expires in <strong>15 minutes.</strong>
                        </p>
                        <Link
                            href="/login"
                            className="text-sm text-(--primary) font-medium hover:underline"
                        >
                            ← Back to sign in
                        </Link>
                    </div>
                ) : (
                    // ---- Form State ----
                    <>
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-(--foreground)">
                                Forgot password?
                            </h1>
                            <p className="text-sm text-(--muted-foreground) mt-1">
                                Enter your email and we&apos;ll send you a reset link.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            <div>
                                <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                    Email
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
                                {isSubmitting ? "Sending..." : "Send Reset Link"}
                            </button>

                        </form>

                        <p className="text-center text-sm text-(--muted-foreground) mt-6">
                            Remember your password?{" "}
                            <Link href="/login" className="text-(--primary) font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </>
                )}

            </div>
        </div>
    )
}