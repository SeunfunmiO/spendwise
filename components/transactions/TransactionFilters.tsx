"use client"
import { useTranslations } from "next-intl"
import { CATEGORIES } from "@/constants/categories"
import type { TransactionFilters } from "@/types"

interface Props {
    filters: TransactionFilters
    onChange: (filters: TransactionFilters) => void
    onReset: () => void
}

export default function TransactionFilters({ filters, onChange, onReset }: Props) {
    const t = useTranslations("transactions")

    return (
        <div className="flex flex-wrap gap-3 items-center">

            {/* Search */}
            <input
                type="text"
                placeholder={t("search")}
                value={filters.search ?? ""}
                onChange={(e) => onChange({ ...filters, search: e.target.value })}
                className="px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) w-56"
            />

            {/* Type */}
            <select
                value={filters.type ?? "all"}
                onChange={(e) => onChange({ ...filters, type: e.target.value as any })}
                className="px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
            >
                <option value="all">{t("allTypes")}</option>
                <option value="income">{t("income")}</option>
                <option value="expense">{t("expense")}</option>
            </select>

            {/* Category */}
            <select
                value={filters.category ?? ""}
                onChange={(e) => onChange({ ...filters, category: e.target.value })}
                className="px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
            >
                <option value="">{t("allCategories")}</option>
                {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                        {cat.label}
                    </option>
                ))}
            </select>

            {/* Date From */}
            <input
                type="date"
                value={filters.dateFrom ?? ""}
                onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                className="px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />

            {/* Date To */}
            <input
                type="date"
                value={filters.dateTo ?? ""}
                onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                className="px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />

            {/* Reset */}
            <button
                onClick={onReset}
                className="px-3 py-2 text-sm rounded-lg border border-(--border) text-(--muted-foreground) hover:bg-(--secondary) transition-colors"
            >
                {t("reset")}
            </button>

        </div>
    )
}