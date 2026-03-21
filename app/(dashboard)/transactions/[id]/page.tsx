"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  RefreshCw,
  Calendar,
  Tag,
  FileText,
  Clock,
  SearchAlert,
} from "lucide-react"
import { getTransactionById, deleteTransaction } from "@/lib/actions/transaction.actions"
import { getCategoryMeta } from "@/constants/categories"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useUserPreferences } from "@/hooks/useUserPreferences"
import TransactionForm from "@/components/transactions/TransactionForm"
import ConfirmModal from "@/components/ui/ConfirmModal"
import type { TransactionData } from "@/types"

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("transactions")
  const { currency, dateFormat } = useUserPreferences()

  const [transaction, setTransaction] = useState<TransactionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const id = params.id as string

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const result = await getTransactionById(id)
      if (!result.success || !result.data) {
        setNotFound(true)
      } else {
        setTransaction(result.data)
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteTransaction(id)
    setDeleting(false)
    if (result.success) {
      router.push("/transactions")
    }
  }

  const handleEditSuccess = async () => {
    // Re-fetch updated transaction
    const result = await getTransactionById(id)
    if (result.success && result.data) {
      setTransaction(result.data)
    }
    setPanelOpen(false)
  }

  const meta = transaction ? getCategoryMeta(transaction.category) : null
  const Icon = meta?.icon

  // ---- Loading ----
  if (loading) {
    return (
      <div className="py-6 max-w-2xl space-y-6">
        <div className="h-8 w-48 bg-(--secondary) rounded-lg animate-pulse" />
        <div className="bg-(--card) rounded-xl border border-(--border) p-6 space-y-4">
          <div className="h-16 bg-(--secondary) rounded-lg animate-pulse" />
          <div className="h-10 bg-(--secondary) rounded-lg animate-pulse" />
          <div className="h-10 bg-(--secondary) rounded-lg animate-pulse" />
          <div className="h-10 bg-(--secondary) rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  // ---- Not Found ----
  if (notFound || !transaction) {
    return (
      <div className="py-6 max-w-2xl">
        <button
          onClick={() => router.push("/transactions")}
          className="flex items-center gap-2 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          {t("backToTransactions")}
        </button>
        <div className="text-center py-16 text-(--muted-foreground)">
          <p className="text-5xl mb-4"><SearchAlert size={20}/></p>
          <p className="text-sm font-medium">{t("transactionNotFound")}</p>
          <p className="text-xs mt-1">{t("transactionNotFoundDesc")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 max-w-2xl space-y-6">

      {/* Back Button */}
      <button
        onClick={() => router.push("/transactions")}
        className="flex items-center gap-2 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors"
      >
        <ArrowLeft size={16} />
        {t("backToTransactions")}
      </button>

      {/* Header Card */}
      <div className="bg-(--card) rounded-xl border border-(--border) p-6">
        <div className="flex items-start justify-between gap-4">

          {/* Category Icon + Title */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: meta?.color ? `${meta.color}20` : "var(--secondary)",
              }}
            >
              {Icon ? (
                <Icon size={24} style={{ color: meta?.color }} />
              ) : (
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: "#71717a" }}
                />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-(--foreground)">
                {transaction.title}
              </h2>
              <p className="text-sm text-(--muted-foreground) mt-0.5">
                {transaction.category}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right shrink-0">
            <p
              className={`text-2xl font-bold ${
                transaction.type === "income" ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrency(transaction.amount, currency)}
            </p>
            <span
              className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                transaction.type === "income"
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"
              }`}
            >
              {t(transaction.type)}
            </span>
          </div>

        </div>
      </div>

      {/* Details Card */}
      <div className="bg-(--card) rounded-xl border border-(--border) p-6 space-y-4">
        <h3 className="text-sm font-semibold text-(--foreground)">{t("details")}</h3>

        {/* Date */}
        <div className="flex items-center justify-between py-3 border-b border-(--border)">
          <div className="flex items-center gap-3 text-(--muted-foreground)">
            <Calendar size={16} />
            <span className="text-sm">{t("date")}</span>
          </div>
          <span className="text-sm font-medium text-(--foreground)">
            {formatDate(transaction.date, dateFormat)}
          </span>
        </div>

        {/* Category */}
        <div className="flex items-center justify-between py-3 border-b border-(--border)">
          <div className="flex items-center gap-3 text-(--muted-foreground)">
            <Tag size={16} />
            <span className="text-sm">{t("category")}</span>
          </div>
          <div className="flex items-center gap-2">
            {Icon && <Icon size={14} style={{ color: meta?.color }} />}
            <span className="text-sm font-medium text-(--foreground)">
              {transaction.category}
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start justify-between py-3 border-b border-(--border)">
          <div className="flex items-center gap-3 text-(--muted-foreground)">
            <FileText size={16} />
            <span className="text-sm">{t("note")}</span>
          </div>
          <span className="text-sm font-medium text-(--foreground) text-right max-w-[60%]">
            {transaction.note || (
              <span className="text-(--muted-foreground) font-normal">
                {t("notProvided")}
              </span>
            )}
          </span>
        </div>

        {/* Recurring */}
        <div className="flex items-center justify-between py-3 border-b border-(--border)">
          <div className="flex items-center gap-3 text-(--muted-foreground)">
            <RefreshCw size={16} />
            <span className="text-sm">{t("recurring")}</span>
          </div>
          <span className="text-sm font-medium text-(--foreground)">
            {transaction.isRecurring ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {t("recurringEvery")} {t(transaction.recurringInterval ?? "monthly")}
              </span>
            ) : (
              <span className="text-(--muted-foreground) font-normal">—</span>
            )}
          </span>
        </div>

        {/* Created At */}
        <div className="flex items-center justify-between py-3 border-b border-(--border)">
          <div className="flex items-center gap-3 text-(--muted-foreground)">
            <Clock size={16} />
            <span className="text-sm">{t("createdAt")}</span>
          </div>
          <span className="text-sm font-medium text-(--foreground)">
            {formatDate(transaction.createdAt, dateFormat)}
          </span>
        </div>

        {/* Updated At */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3 text-(--muted-foreground)">
            <Clock size={16} />
            <span className="text-sm">{t("updatedAt")}</span>
          </div>
          <span className="text-sm font-medium text-(--foreground)">
            {formatDate(transaction.updatedAt, dateFormat)}
          </span>
        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setPanelOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--secondary) transition-colors"
        >
          <Pencil size={16} />
          {t("save")}
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Trash2 size={16} />
          {t("deleteConfirmTitle")}
        </button>
      </div>

      {/* Edit Form */}
      <TransactionForm
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSuccess={handleEditSuccess}
        transaction={transaction}
      />

      {/* Delete Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title={t("deleteConfirmTitle")}
        message={t("deleteConfirm")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

    </div>
  )
}