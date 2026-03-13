"use client"
import { CATEGORIES } from "@/constants/categories"
import type { TransactionFilters } from "@/types"

interface Props {
    filters: TransactionFilters
    onChange: (filters: TransactionFilters) => void
    onReset: () => void
}

export default function TransactionFilters({ filters, onChange, onReset }: Props) {
    return (
        <div className="flex flex-wrap gap-3 items-center">

            {/* Search */}
            <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search ?? ""}
                onChange={(e) => onChange({ ...filters, search: e.target.value })}
                className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] w-56"
            />

            {/* Type */}
            <select
                value={filters.type ?? "all"}
                onChange={(e) => onChange({ ...filters, type: e.target.value as any })}
                className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
            </select>

            {/* Category */}
            <select
                value={filters.category ?? ""}
                onChange={(e) => onChange({ ...filters, category: e.target.value })}
                className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
                <option value="">All Categories</option>
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
                className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />

            {/* Date To */}
            <input
                type="date"
                value={filters.dateTo ?? ""}
                onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />

            {/* Reset */}
            <button
                onClick={onReset}
                className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors"
            >
                Reset
            </button>

        </div>
    )
}