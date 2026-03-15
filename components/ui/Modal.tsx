"use client"
import { useEffect } from "react"
import { X } from "lucide-react"

interface Props {
    open: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    maxWidth?: "sm" | "md" | "lg"
}

export default function Modal({
    open,
    onClose,
    title,
    children,
    maxWidth = "sm",
}: Props) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [open])

    if (!open) return null

    const maxWidthClass = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
    }[maxWidth]

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div
                    className={`bg-(--card) rounded-2xl border border-(--border) shadow-xl w-full ${maxWidthClass}`}
                >
                    {/* Header — only shows if title is provided */}
                    {title && (
                        <div className="flex items-center justify-between px-6 py-4 border-b border-(--border)">
                            <h3 className="text-base font-semibold text-(--foreground)">
                                {title}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-(--secondary) text-(--muted-foreground) transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}