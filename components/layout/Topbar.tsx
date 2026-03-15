"use client"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Sun, Moon, Bell } from "lucide-react"
import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/constants/navigation"

export default function Topbar() {
    const { data: session } = useSession()
    const { theme, setTheme } = useTheme()
    const pathname = usePathname()
    const t = useTranslations("nav")
    const tCommon = useTranslations("common")
    const user = session?.user

    // Find current page key from NAV_ITEMS and translate it
    const currentItem = NAV_ITEMS.find((item) => {
        if (item.href === "/") return pathname === "/"
        return pathname.startsWith(item.href)
    })
    const pageTitle = currentItem ? t(currentItem.key) : t("overview")

    return (
        <header className="h-16 fixed top-0 right-0 left-0 md:left-64 z-30 flex items-center justify-between px-6 border-b border-(--border) bg-(--background)">

            {/* Page Title */}
            <h1 className="text-lg font-semibold text-(--foreground)">
                {pageTitle}
            </h1>

            {/* Right Side */}
            <div className="flex items-center gap-3">

                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-lg hover:bg-(--secondary) text-(--muted-foreground) transition-colors"
                    aria-label={tCommon("toggleTheme")}
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notifications */}
                <button
                    className="p-2 rounded-lg hover:bg-(--secondary) text-(--muted-foreground) transition-colors relative"
                    aria-label={tCommon("notifications")}
                >
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-(--primary) rounded-full" />
                </button>

                {/* Avatar */}
                <div className="flex items-center gap-2">
                    {user?.image ? (
                        <Image
                            src={user.image}
                            alt={user.name ?? "User"}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-(--primary) flex items-center justify-center text-white text-sm font-semibold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-(--foreground)">
                        {user?.name}
                    </span>
                </div>

            </div>
        </header>
    )
}