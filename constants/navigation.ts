import {
    LayoutDashboard,
    ArrowLeftRight,
    Target,
    BarChart2,
    Settings,
    Sparkles,
} from "lucide-react"

export const NAV_ITEMS = [
    { key: "overview", href: "/", icon: LayoutDashboard },
    { key: "transactions", href: "/transactions", icon: ArrowLeftRight },
    { key: "budgets", href: "/budgets", icon: Target },
    { key: "reports", href: "/reports", icon: BarChart2 },
    { key: "settings", href: "/settings", icon: Settings },
    { key: "upgrade", href: "/upgrade", icon: Sparkles },
] as const

export const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 5)