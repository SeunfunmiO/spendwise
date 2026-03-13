"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/constants/navigation"
import { logoutUser } from "@/lib/actions/auth.actions"
import { LogOut } from "lucide-react"

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-(--sidebar-border) bg-(--sidebar) z-40">

            {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-5 border-b border-(--sidebar-border)">
                <span className="text-2xl">💰</span>
                <span className="text-xl font-bold text-(--primary)">SpendWise</span>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-(--sidebar-active) text-(--sidebar-active-foreground)"
                                    : "text-(--muted-foreground) hover:bg-(--secondary) hover:text-(--foreground)"
                                }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-(--sidebar-border)">
                <form action={logoutUser}>
                    <button
                        type="submit"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-(--muted-foreground) hover:bg-[var(--destructive)] hover:text-white transition-colors w-full"
                    >
                        <LogOut size={18} />
                        Log out
                    </button>
                </form>
            </div>

        </aside>
    )
}