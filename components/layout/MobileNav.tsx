"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { MOBILE_NAV_ITEMS } from "@/constants/navigation"

export default function MobileNav() {
    const pathname = usePathname()
    const t = useTranslations("nav")

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-(--sidebar) border-t border-(--sidebar-border)">
            <div className="flex items-center justify-around px-2 py-2">
                {MOBILE_NAV_ITEMS.map((item) => {
                    const isActive =
                        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isActive
                                    ? "text-(--primary)"
                                    : "text-(--muted-foreground)"
                                }`}
                        >
                            <Icon size={20} />
                            <span className="text-[10px] font-medium">{t(item.key)}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}