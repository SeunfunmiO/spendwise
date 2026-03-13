import {
    LayoutDashboard,
    ArrowLeftRight,
    Target,
    BarChart2,
    Settings,
    Sparkles,
} from "lucide-react"

export const NAV_ITEMS = [
    {
        label: "Overview",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Transactions",
        href: "/transactions",
        icon: ArrowLeftRight,
    },
    {
        label: "Budgets",
        href: "/budgets",
        icon: Target,
    },
    {
        label: "Reports",
        href: "/reports",
        icon: BarChart2,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
    },
    {
        label: "Upgrade",
        href: "/upgrade",
        icon: Sparkles,
    },
]