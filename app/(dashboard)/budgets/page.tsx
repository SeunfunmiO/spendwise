"use client"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import type { BudgetData } from "@/types"
import { deleteBudget, getBudgets } from "@/lib/actions/budget.actions"
import BudgetCard from "@/components/budgets/BudgetCard"
import BudgetForm from "@/components/budgets/BudgetForm"
import ConfirmModal from "@/components/ui/ConfirmModal"

export default function BudgetsPage() {
    const { data: session } = useSession()
    const currency = (session?.user as any)?.currency ?? "NGN"
    const t = useTranslations("budgets")

    const [budgets, setBudgets] = useState<BudgetData[]>([])
    const [loading, setLoading] = useState(true)
    const [panelOpen, setPanelOpen] = useState(false)
    const [editingBudget, setEditingBudget] = useState<BudgetData | null>(null)
    const [confirmId, setConfirmId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchBudgets = async () => {
        try {
            setLoading(true)
            const result = await getBudgets()
            if (result.success && result.data) {
                setBudgets(result.data)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                const result = await getBudgets()
                if (result.success && result.data) {
                    setBudgets(result.data)
                }
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const handleEdit = (budget: BudgetData) => {
        setEditingBudget(budget)
        setPanelOpen(true)
    }

    const handleAddNew = () => {
        setEditingBudget(null)
        setPanelOpen(true)
    }

    const handleClose = () => {
        setPanelOpen(false)
        setEditingBudget(null)
    }

    const handleDeleteClick = (id: string) => {
        setConfirmId(id)
    }

    const handleConfirmDelete = async () => {
        if (!confirmId) return
        setDeleting(true)
        const result = await deleteBudget(confirmId)
        setDeleting(false)
        setConfirmId(null)
        if (result.success) fetchBudgets()
    }

    // Group budgets by period
    const weekly = budgets.filter((b) => b.period === "weekly")
    const monthly = budgets.filter((b) => b.period === "monthly")
    const annual = budgets.filter((b) => b.period === "annual")

    return (
        <div className="py-6 space-y-8">

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-(--foreground)">{t("title")}</h2>
                    <p className="text-sm text-(--muted-foreground) mt-1">
                        {budgets.length} {budgets.length === 1 ? t("budgetFor") : t("title").toLowerCase()} {t("title").toLowerCase()}
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus size={16} />
                    {t("addBudget")}
                </button>
            </div>

            {loading ? (
                <div className="py-16 text-center text-(--muted-foreground) text-sm">
                    {t("loading")}
                </div>
            ) : budgets.length === 0 ? (
                <div className="text-center py-16 text-(--muted-foreground)">
                    <p className="text-5xl mb-4">🎯</p>
                    <p className="text-sm font-medium">{t("noBudgets")}</p>
                    <p className="text-xs mt-1">{t("noBudgetsDesc")}</p>
                </div>
            ) : (
                <div className="space-y-8">

                    {/* Monthly */}
                    {monthly.length > 0 && (
                        <section>
                            <h3 className="text-sm font-semibold text-(--muted-foreground) uppercase tracking-wider mb-4">
                                {t("monthly")}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {monthly.map((budget) => (
                                    <BudgetCard
                                        key={budget._id}
                                        budget={budget}
                                        currency={currency}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Weekly */}
                    {weekly.length > 0 && (
                        <section>
                            <h3 className="text-sm font-semibold text-(--muted-foreground) uppercase tracking-wider mb-4">
                                {t("weekly")}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {weekly.map((budget) => (
                                    <BudgetCard
                                        key={budget._id}
                                        budget={budget}
                                        currency={currency}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Annual */}
                    {annual.length > 0 && (
                        <section>
                            <h3 className="text-sm font-semibold text-(--muted-foreground) uppercase tracking-wider mb-4">
                                {t("annual")}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {annual.map((budget) => (
                                    <BudgetCard
                                        key={budget._id}
                                        budget={budget}
                                        currency={currency}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            )}

            {/* Budget Form */}
            <BudgetForm
                open={panelOpen}
                onClose={handleClose}
                onSuccess={fetchBudgets}
                budget={editingBudget}
            />

            {/* Confirm Delete */}
            <ConfirmModal
                open={!!confirmId}
                title={t("deleteConfirmTitle")}
                message={t("deleteConfirm")}
                loading={deleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmId(null)}
            />

        </div>
    )
}