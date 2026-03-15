"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { getTransactions } from "@/lib/actions/transaction.actions"
import TransactionTable from "@/components/transactions/TransactionTable"
import TransactionFilters from "@/components/transactions/TransactionFilters"
import TransactionForm from "@/components/transactions/TransactionForm"
import type { TransactionData, TransactionFilters as IFilters } from "@/types"

const DEFAULT_FILTERS: IFilters = {
    type: "all",
    category: "",
    search: "",
    dateFrom: "",
    dateTo: "",
}

export default function TransactionsPage() {
    const { data: session } = useSession()
    const currency = (session?.user as any)?.currency ?? "NGN"
    const t = useTranslations("transactions")

    const [transactions, setTransactions] = useState<TransactionData[]>([])
    const [filters, setFilters] = useState<IFilters>(DEFAULT_FILTERS)
    const [loading, setLoading] = useState(true)
    const [panelOpen, setPanelOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<TransactionData | null>(null)

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true)
            const result = await getTransactions(filters)
            if (result.success && result.data) {
                setTransactions(result.data)
            }
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            try {
                setLoading(true)
                const result = await getTransactions(filters)
                if (!cancelled && result.success && result.data) {
                    setTransactions(result.data)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [filters])

    const handleEdit = (transaction: TransactionData) => {
        setEditingTransaction(transaction)
        setPanelOpen(true)
    }

    const handleAddNew = () => {
        setEditingTransaction(null)
        setPanelOpen(true)
    }

    const handleClose = () => {
        setPanelOpen(false)
        setEditingTransaction(null)
    }

    return (
        <div className="py-6 space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-(--foreground)">
                        {t("title")}
                    </h2>
                    <p className="text-sm text-(--muted-foreground) mt-1">
                        {transactions.length !== 1
                            ? t("foundPlural", { count: transactions.length })
                            : t("found", { count: transactions.length })}
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus size={16} />
                    {t("addTransaction")}
                </button>
            </div>

            {/* Filters */}
            <TransactionFilters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(DEFAULT_FILTERS)}
            />

            {/* Table Card */}
            <div className="rounded-xl border border-(--border) bg-(--card) overflow-hidden">
                {loading ? (
                    <div className="py-16 text-center text-(--muted-foreground) text-sm">
                        {t("loading")}
                    </div>
                ) : (
                    <TransactionTable
                        transactions={transactions}
                        currency={currency}
                        onEdit={handleEdit}
                        onDeleted={fetchTransactions}
                    />
                )}
            </div>

            {/* Slide-over Form */}
            <TransactionForm
                open={panelOpen}
                onClose={handleClose}
                onSuccess={fetchTransactions}
                transaction={editingTransaction}
            />

        </div>
    )
}