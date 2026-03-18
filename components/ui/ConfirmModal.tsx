"use client"
import { useTranslations } from "next-intl"
import { AlertTriangle } from "lucide-react"
import Modal from "@/components/ui/Modal"

interface Props {
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "danger" | "warning"
    loading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant = "danger",
    loading = false,
    onConfirm,
    onCancel,
}: Props) {
    const t = useTranslations("common")

    return (
        <Modal open={open} onClose={onCancel}>
            <div className="space-y-4">

                {/* Icon + Title */}
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${variant === "danger"
                                ? "bg-red-100 dark:bg-red-950"
                                : "bg-amber-100 dark:bg-amber-950"
                            }`}
                    >
                        <AlertTriangle
                            size={20}
                            className={
                                variant === "danger" ? "text-red-500" : "text-amber-500"
                            }
                        />
                    </div>
                    <h3 className="text-base font-semibold text-(--foreground)">
                        {title}
                    </h3>
                </div>

                {/* Message */}
                <p className="text-sm text-(--muted-foreground) leading-relaxed">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-2 flex-wrap">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-(--border) text-(--muted-foreground) hover:bg-(--secondary) transition-colors disabled:opacity-50"
                    >
                        {cancelLabel ?? t("cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg text-white transition-opacity disabled:opacity-50 hover:opacity-90 ${variant === "danger" ? "bg-red-500" : "bg-amber-500"
                            }`}
                    >
                        {loading ? "..." : confirmLabel ?? t("delete")}
                    </button>
                </div>

            </div>
        </Modal>
    )
}
