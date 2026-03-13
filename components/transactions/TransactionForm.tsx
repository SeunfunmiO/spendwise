"use client"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { CATEGORIES } from "@/constants/categories"
import { createTransaction, updateTransaction } from "@/lib/actions/transaction.actions"
import type { TransactionData, TransactionInput } from "@/types"

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    transaction?: TransactionData | null
}

const EMPTY_FORM: TransactionInput = {
    title: "",
    amount: 0,
    type: "expense",
    category: "Food & Dining",
    date: new Date().toISOString().split("T")[0],
    note: "",
    isRecurring: false,
    recurringInterval: undefined,
    customCategory: "",
}

export default function TransactionForm({ open, onClose, onSuccess, transaction }: Props) {
    const [form, setForm] = useState<TransactionInput>(EMPTY_FORM)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const isEdit = !!transaction

    useEffect(() => {
        if (transaction) {
            // Check if the saved category matches a known one
            const isKnownCategory = CATEGORIES.some((c) => c.value === transaction.category)
            setForm({
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
            setForm(EMPTY_FORM)
        }
        setError("")
    }, [transaction, open])

    const handleSubmit = async () => {
        setLoading(true)
        setError("")

        // Validate custom category if "Other" selected
        if (form.category === "Other" && !form.customCategory?.trim()) {
            setError("Please describe the category")
            setLoading(false)
            return
        }

        const result = isEdit
            ? await updateTransaction(transaction!._id, form)
            : await createTransaction(form)

        setLoading(false)

        if (!result.success) {
            setError(result.error)
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
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--card)] z-50 shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">
                        {isEdit ? "Edit Transaction" : "Add Transaction"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

                    {/* Type Toggle */}
                    <div>
                        <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">
                            Type
                        </label>
                        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
                            {(["expense", "income"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setForm({ ...form, type: t })}
                                    className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${form.type === t
                                            ? t === "income"
                                                ? "bg-emerald-500 text-white"
                                                : "bg-red-500 text-white"
                                            : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Grocery shopping"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            placeholder="0.00"
                            min={0}
                            value={form.amount || ""}
                            onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.category}
                            onChange={(e) =>
                                setForm({ ...form, category: e.target.value, customCategory: "" })
                            }
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>

                        {/* Custom category — only shows when "Other" is selected */}
                        {form.category === "Other" && (
                            <input
                                type="text"
                                placeholder="e.g. Wedding Gift, Tax Refund..."
                                value={form.customCategory ?? ""}
                                onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                                className="mt-2 w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                        )}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">
                            Note{" "}
                            <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
                        </label>
                        <textarea
                            placeholder="Add a note..."
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                        />
                    </div>

                    {/* Recurring */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isRecurring}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        isRecurring: e.target.checked,
                                        recurringInterval: undefined,
                                    })
                                }
                                className="w-4 h-4 accent-[var(--primary)]"
                            />
                            <span className="text-sm font-medium text-[var(--foreground)]">
                                Recurring transaction
                            </span>
                        </label>

                        {form.isRecurring && (
                            <select
                                value={form.recurringInterval ?? "monthly"}
                                onChange={(e) =>
                                    setForm({ ...form, recurringInterval: e.target.value as any })
                                }
                                className="mt-3 w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
                            {error}
                        </p>
                    )}

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[var(--border)] flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Transaction"}
                    </button>
                </div>

            </div>
        </>
    )
}