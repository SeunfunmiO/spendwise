"use client"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { Sun, Moon, Bell } from "lucide-react"
import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/constants/navigation"
import Image from "next/image"

export default function Topbar() {
    const { data: session } = useSession()
    const { theme, setTheme } = useTheme()
    const pathname = usePathname()

    const currentPage = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Dashboard"
    const user = session?.user

    return (
        <header className="h-16 fixed top-0 right-0 left-0 md:left-64 z-30 flex items-center justify-between px-6 border-b border-(--border) bg-(--background)">

            {/* Page Title */}
            <h1 className="text-lg font-semibold text-(--foreground)">
                {currentPage}
            </h1>

            {/* Right Side */}
            <div className="flex items-center gap-3">

                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-lg hover:bg-(--secondary) text-(--muted-foreground) transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notifications */}
                <button className="p-2 rounded-lg hover:bg-(--secondary) text-(--muted-foreground) transition-colors relative">
                    <Bell size={18} />
                    {/* Notification dot */}
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-(--primary) rounded-full" />
                </button>

                {/* Avatar */}
                <div className="flex items-center gap-2">
                    {user?.image ? (
                        <Image
                            src={user.image}
                            alt={user.name ?? "User"}
                            className="w-8 h-8 rounded-full object-cover"
                            width={100}
                            height={100}
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