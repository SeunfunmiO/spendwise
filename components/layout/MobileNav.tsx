"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { X, Settings, Sparkles, MoreHorizontal } from "lucide-react"
import { NAV_ITEMS } from "@/constants/navigation"

const MAIN_NAV = NAV_ITEMS.slice(0, 4)

export default function MobileNav() {
    const pathname = usePathname()
    const t = useTranslations("nav")
    const [showMore, setShowMore] = useState(false)

    const isMoreActive =
        pathname.startsWith("/settings") || pathname.startsWith("/upgrade")

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-(--sidebar) border-t border-(--sidebar-border)">
                <div className="flex items-center justify-around px-2 py-2">

                    {/* First 4 nav items */}
                    {MAIN_NAV.map((item) => {
                        const isActive =
                            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isActive ? "text-(--primary)" : "text-(--muted-foreground)"
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="text-[10px] font-medium">{t(item.key)}</span>
                            </Link>
                        )
                    })}

                    {/* More button */}
                    <button
                        onClick={() => setShowMore(true)}
                        className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isMoreActive ? "text-(--primary)" : "text-(--muted-foreground)"
                            }`}
                    >
                        <MoreHorizontal size={20} />
                        <span className="text-[10px] font-medium">{t("more")}</span>
                    </button>

                </div>
            </nav>

            {/* Bottom Sheet */}
            {showMore && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 z-50 md:hidden"
                        onClick={() => setShowMore(false)}
                    />

                    {/* Sheet */}
                    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-(--card) rounded-t-2xl border-t border-(--border) p-6 space-y-2">

                        {/* Handle */}
                        <div className="w-10 h-1 bg-(--border) rounded-full mx-auto mb-4" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-(--foreground)">{t("more")}</p>
                            <button
                                onClick={() => setShowMore(false)}
                                className="p-1.5 rounded-lg hover:bg-(--secondary) text-(--muted-foreground)"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Settings */}
                        <Link
                            href="/settings"
                            onClick={() => setShowMore(false)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${pathname.startsWith("/settings")
                                    ? "bg-(--sidebar-active) text-(--sidebar-active-foreground)"
                                    : "hover:bg-(--secondary) text-(--foreground)"
                                }`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-(--secondary) flex items-center justify-center">
                                <Settings size={18} className="text-(--muted-foreground)" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{t("settings")}</p>
                                <p className="text-xs text-(--muted-foreground)">{t("manageAccount")}</p>
                            </div>
                        </Link>

                        {/* Upgrade */}
                        <Link
                            href="/upgrade"
                            onClick={() => setShowMore(false)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${pathname.startsWith("/upgrade")
                                    ? "bg-(--sidebar-active) text-(--sidebar-active-foreground)"
                                    : "hover:bg-(--secondary) text-(--foreground)"
                                }`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                                <Sparkles size={18} className="text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{t("upgrade")}</p>
                                <p className="text-xs text-(--muted-foreground)">{t("unlockPremium")}</p>
                            </div>
                        </Link>

                    </div>
                </>
            )}
        </>
    )
}