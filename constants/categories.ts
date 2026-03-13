import {
    Utensils,
    Car,
    Home,
    Heart,
    ShoppingBag,
    Tv,
    GraduationCap,
    Zap,
    Briefcase,
    Laptop,
    Building2,
    MoreHorizontal,
} from "lucide-react"

export const CATEGORIES = [
    { value: "Food & Dining", label: "Food & Dining", icon: Utensils, color: "#f59e0b" },
    { value: "Transport", label: "Transport", icon: Car, color: "#3b82f6" },
    { value: "Housing & Rent", label: "Housing & Rent", icon: Home, color: "#8b5cf6" },
    { value: "Healthcare", label: "Healthcare", icon: Heart, color: "#ef4444" },
    { value: "Shopping", label: "Shopping", icon: ShoppingBag, color: "#ec4899" },
    { value: "Entertainment", label: "Entertainment", icon: Tv, color: "#06b6d4" },
    { value: "Education", label: "Education", icon: GraduationCap, color: "#10b981" },
    { value: "Utilities", label: "Utilities", icon: Zap, color: "#f97316" },
    { value: "Salary", label: "Salary", icon: Briefcase, color: "#10b981" },
    { value: "Freelance", label: "Freelance", icon: Laptop, color: "#6366f1" },
    { value: "Business", label: "Business", icon: Building2, color: "#14b8a6" },
    { value: "Other", label: "Other", icon: MoreHorizontal, color: "#71717a" },
] as const

export type CategoryValue = typeof CATEGORIES[number]["value"]

export function getCategoryMeta(value: string) {
    return CATEGORIES.find((c) => c.value === value)
}