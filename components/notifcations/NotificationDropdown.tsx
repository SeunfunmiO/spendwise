"use client"
import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Bell } from "lucide-react"
import Link from "next/link"
import {
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    type NotificationData,
} from "@/lib/actions/notification.actions"
import NotificationItem from "./NotificationItem"


export default function NotificationDropdown() {
    const t = useTranslations("notifications")
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<NotificationData[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    // Fetch unread count on mount
    useEffect(() => {
        const fetchCount = async () => {
            const result = await getUnreadCount()
            if (result.success && result.data) {
                setUnreadCount(result.data.count)
            }
        }
        fetchCount()

        // Poll every 30 seconds
        const interval = setInterval(fetchCount, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleOpen = async () => {
        setOpen(!open)
        if (!open) {
            setLoading(true)
            const result = await getNotifications()
            if (result.success && result.data) {
                setNotifications(result.data.slice(0, 5))
            }
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        const [notifResult, countResult] = await Promise.all([
            getNotifications(),
            getUnreadCount(),
        ])
        if (notifResult.success && notifResult.data) {
            setNotifications(notifResult.data.slice(0, 5))
        }
        if (countResult.success && countResult.data) {
            setUnreadCount(countResult.data.count)
        }
    }

    const handleMarkAllRead = async () => {
        await markAllAsRead()
        await handleUpdate()
    }

    return (
        <div className="relative" ref={dropdownRef}>

            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className="p-2 rounded-lg hover:bg-(--secondary) text-(--muted-foreground) transition-colors relative"
                aria-label={t("title")}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-(--card) rounded-xl border border-(--border) shadow-xl z-50 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-(--foreground)">{t("title")}</p>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-(--primary) text-white px-1.5 py-0.5 rounded-full">
                                    {unreadCount} {t("unread")}
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-(--primary) hover:underline"
                            >
                                {t("markAllRead")}
                            </button>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="max-h-80 overflow-y-auto p-2">
                        {loading ? (
                            <div className="space-y-2 p-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 bg-(--secondary) rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8 text-(--muted-foreground)">
                                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm">{t("empty")}</p>
                                <p className="text-xs mt-0.5">{t("emptyDesc")}</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <NotificationItem
                                    key={n._id}
                                    notification={n}
                                    onUpdate={handleUpdate}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-(--border) p-2">
                            <Link
                                href="/notifications"
                                onClick={() => setOpen(false)}
                                className="block text-center text-sm text-(--primary) hover:underline py-1"
                            >
                                {t("viewAll")}
                            </Link>
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}