"use client"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Bell, Trash2, CheckCheck } from "lucide-react"
import {
    getNotifications,
    markAllAsRead,
    clearAllNotifications,
    type NotificationData,
} from "@/lib/actions/notification.actions"
import ConfirmModal from "@/components/ui/ConfirmModal"
import NotificationItem from "@/components/notifcations/NotificationItem"

export default function NotificationsPage() {
    const t = useTranslations("notifications")
    const [notifications, setNotifications] = useState<NotificationData[]>([])
    const [loading, setLoading] = useState(true)
    const [showClearModal, setShowClearModal] = useState(false)
    const [clearing, setClearing] = useState(false)

    const fetchNotifications = async () => {
        setLoading(true)
        const result = await getNotifications()
        if (result.success && result.data) {
            setNotifications(result.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        const fetchAllNotifications = () => {
            fetchNotifications()
        }
        fetchAllNotifications()
    }, [])

    const handleMarkAllRead = async () => {
        await markAllAsRead()
        await fetchNotifications()
    }

    const handleClearAll = async () => {
        setClearing(true)
        await clearAllNotifications()
        setClearing(false)
        setShowClearModal(false)
        setNotifications([])
    }

    const unreadCount = notifications.filter((n) => !n.read).length

    return (
        <div className="py-6 max-w-2xl space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-(--foreground)">{t("title")}</h2>
                    {unreadCount > 0 && (
                        <p className="text-sm text-(--muted-foreground) mt-1">
                            {unreadCount} {t("unread")}
                        </p>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--secondary) transition-colors"
                            >
                                <CheckCheck size={15} />
                                {t("markAllRead")}
                            </button>
                        )}
                        <button
                            onClick={() => setShowClearModal(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-(--border) text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                            <Trash2 size={15} />
                            {t("clearAll")}
                        </button>
                    </div>
                )}
            </div>

            {/* Notifications List */}
            <div className="bg-(--card) rounded-xl border border-(--border) overflow-hidden">
                {loading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-(--secondary) rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16 text-(--muted-foreground)">
                        <Bell size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">{t("empty")}</p>
                        <p className="text-xs mt-1">{t("emptyDesc")}</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {notifications.map((n) => (
                            <NotificationItem
                                key={n._id}
                                notification={n}
                                onUpdate={fetchNotifications}
                                showDelete
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Clear All Modal */}
            <ConfirmModal
                open={showClearModal}
                title={t("clearAll")}
                message="Are you sure you want to clear all notifications? This cannot be undone."
                loading={clearing}
                onConfirm={handleClearAll}
                onCancel={() => setShowClearModal(false)}
            />

        </div>
    )
}