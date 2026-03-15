"use client"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { budgetSchema, type BudgetInput } from "@/lib/schemas"
import { CATEGORIES } from "@/constants/categories"
import { createBudget, updateBudget } from "@/lib/actions/budget.actions"
import type { BudgetData } from "@/types"

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    budget?: BudgetData | null
}

export default function BudgetForm({ open, onClose, onSuccess, budget }: Props) {
    const [serverError, setServerError] = useState("")
    const isEdit = !!budget
    const t = useTranslations("budgets")

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<BudgetInput>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            category: "Food & Dining",
            limit: 0,
            period: "monthly",
        },
    })

    useEffect(() => {
        const initialize = () => {
            if (budget) {
                reset({
                    category: budget.category,
                    limit: budget.limit,
                    period: budget.period,
                })
            } else {
                reset({
                    category: "Food & Dining",
                    limit: 0,
                    period: "monthly",
                })
            }
            setServerError("")
        }

        initialize()
    }, [budget, open, reset])

    const onSubmit = async (data: BudgetInput) => {
        setServerError("")

        const result = isEdit
            ? await updateBudget(budget!._id, data)
            : await createBudget(data)

        if (!result.success) {
            setServerError(result.error)
            return
        }

        onSuccess()
        onClose()
    }

    if (!open) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-(--card) z-50 shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-(--border)">
                    <h2 className="text-lg font-semibold text-(--foreground)">
                        {isEdit ? t("editBudget") : t("addBudget")}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-(--secondary) text-(--muted-foreground) transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex-1 overflow-y-auto flex flex-col"
                >
                    <div className="flex-1 px-6 py-6 space-y-5">

                        {/* Category */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                {t("category")} <span className="text-red-500">{t("required")}</span>
                            </label>
                            <select
                                {...register("category")}
                                disabled={isEdit}
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
                            )}
                        </div>

                        {/* Period */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                {t("period")} <span className="text-red-500">{t("required")}</span>
                            </label>
                            <select
                                {...register("period")}
                                disabled={isEdit}
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="weekly">{t("weekly")}</option>
                                <option value="monthly">{t("monthly")}</option>
                                <option value="annual">{t("annual")}</option>
                            </select>
                            {errors.period && (
                                <p className="text-xs text-red-500 mt-1">{errors.period.message}</p>
                            )}
                        </div>

                        {/* Limit */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                {t("limit")} <span className="text-red-500">{t("required")}</span>
                            </label>
                            <input
                                {...register("limit", { valueAsNumber: true })}
                                type="number"
                                placeholder="0.00"
                                min={0}
                                step="0.01"
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                            />
                            {errors.limit && (
                                <p className="text-xs text-red-500 mt-1">{errors.limit.message}</p>
                            )}
                        </div>

                        {/* Server Error */}
                        {serverError && (
                            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
                                {serverError}
                            </p>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-(--border) flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-(--border) text-(--muted-foreground) hover:bg-(--secondary) transition-colors"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-(--primary) text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSubmitting ? t("saving") : isEdit ? t("save") : t("add")}
                        </button>
                    </div>
                </form>

            </div>
        </>
    )
}