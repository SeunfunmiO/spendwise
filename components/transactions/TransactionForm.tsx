"use client"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { transactionSchema, type TransactionInput } from "@/lib/schemas"
import { CATEGORIES } from "@/constants/categories"
import { createTransaction, updateTransaction } from "@/lib/actions/transaction.actions"
import type { TransactionData } from "@/types"

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    transaction?: TransactionData | null
}

export default function TransactionForm({ open, onClose, onSuccess, transaction }: Props) {
    const [serverError, setServerError] = useState("")
    const isEdit = !!transaction
    const t = useTranslations("transactions")

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TransactionInput>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            title: "",
            amount: 0,
            type: "expense",
            category: "Food & Dining",
            date: new Date().toISOString().split("T")[0],
            note: "",
            isRecurring: false,
            recurringInterval: undefined,
            customCategory: "",
        },
    })

    const watchType = watch("type")
    const watchCategory = watch("category")
    const watchIsRecurring = watch("isRecurring")

    useEffect(() => {
        if (transaction) {
            const isKnownCategory = CATEGORIES.some((c) => c.value === transaction.category)
            reset({
                title: transaction.title,
                amount: transaction.amount,
                type: transaction.type,
                category: isKnownCategory ? transaction.category : "Other",
                date: transaction.date.split("T")[0],
                note: transaction.note ?? "",
                isRecurring: transaction.isRecurring,
                recurringInterval: transaction.recurringInterval,
                customCategory: isKnownCategory ? "" : transaction.category,
            })
        } else {
            reset({
                title: "",
                amount: 0,
                type: "expense",
                category: "Food & Dining",
                date: new Date().toISOString().split("T")[0],
                note: "",
                isRecurring: false,
                recurringInterval: undefined,
                customCategory: "",
            })
        }
        setServerError("")
    }, [transaction, open, reset])

    const onSubmit = async (data: TransactionInput) => {
        setServerError("")

        const result = isEdit
            ? await updateTransaction(transaction!._id, data)
            : await createTransaction(data)

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
                        {isEdit ? t("editTransaction") : t("addTransaction")}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-(--secondary) text-(--muted-foreground) transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex-1 overflow-y-auto flex flex-col"
                >
                    <div className="flex-1 px-6 py-6 space-y-5">

                        {/* Type Toggle */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-2 block">
                                {t("type")}
                            </label>
                            <div className="flex rounded-lg border border-(--border) overflow-hidden">
                                {(["expense", "income"] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setValue("type", type)}
                                        className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${watchType === type
                                                ? type === "income"
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-red-500 text-white"
                                                : "text-(--muted-foreground) hover:bg-(--secondary)"
                                            }`}
                                    >
                                        {type === "income" ? t("income") : t("expense")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                Title <span className="text-red-500">{t("required")}</span>
                            </label>
                            <input
                                {...register("title")}
                                type="text"
                                placeholder={t("titlePlaceholder")}
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                            />
                            {errors.title && (
                                <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                {t("amount")} <span className="text-red-500">{t("required")}</span>
                            </label>
                            <input
                                {...register("amount", { valueAsNumber: true })}
                                type="number"
                                placeholder="0.00"
                                min={0}
                                step="0.01"
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                            />
                            {errors.amount && (
                                <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                {t("category")} <span className="text-red-500">{t("required")}</span>
                            </label>
                            <select
                                {...register("category")}
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
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

                            {/* Custom category */}
                            {watchCategory === "Other" && (
                                <div className="mt-2">
                                    <input
                                        {...register("customCategory")}
                                        type="text"
                                        placeholder={t("customCategory")}
                                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                                    />
                                    {errors.customCategory && (
                                        <p className="text-xs text-red-500 mt-1">{errors.customCategory.message}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                {t("date")} <span className="text-red-500">{t("required")}</span>
                            </label>
                            <input
                                {...register("date")}
                                type="date"
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                            />
                            {errors.date && (
                                <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>
                            )}
                        </div>

                        {/* Note */}
                        <div>
                            <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
                                {t("note")}{" "}
                                <span className="text-(--muted-foreground) font-normal">{t("noteOptional")}</span>
                            </label>
                            <textarea
                                {...register("note")}
                                placeholder="Add a note..."
                                rows={3}
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) resize-none"
                            />
                            {errors.note && (
                                <p className="text-xs text-red-500 mt-1">{errors.note.message}</p>
                            )}
                        </div>

                        {/* Recurring */}
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    {...register("isRecurring")}
                                    type="checkbox"
                                    className="w-4 h-4 accent-(--primary)"
                                />
                                <span className="text-sm font-medium text-(--foreground)">
                                    {t("recurring")}
                                </span>
                            </label>

                            {watchIsRecurring && (
                                <select
                                    {...register("recurringInterval")}
                                    className="mt-3 w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                                >
                                    <option value="daily">{t("daily")}</option>
                                    <option value="weekly">{t("weekly")}</option>
                                    <option value="monthly">{t("monthly")}</option>
                                </select>
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
                            {isSubmitting
                                ? t("saving")
                                : isEdit
                                    ? t("save")
                                    : t("add")}
                        </button>
                    </div>
                </form>

            </div>
        </>
    )
}