"use client"
import Link from "next/link"
import { X, Bell, Shield, RefreshCw, Sparkles, AlertTriangle } from "lucide-react"
import { markAsRead, deleteNotification } from "@/lib/actions/notification.actions"
import type { NotificationData } from "@/lib/actions/notification.actions"

interface Props {
  notification: NotificationData
  onUpdate: () => void
  showDelete?: boolean
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "recurring":    return <RefreshCw size={16} className="text-blue-500" />
    case "budget_80":    return <AlertTriangle size={16} className="text-amber-500" />
    case "budget_100":   return <AlertTriangle size={16} className="text-red-500" />
    case "welcome":      return <Bell size={16} className="text-emerald-500" />
    case "password_changed": return <Shield size={16} className="text-purple-500" />
    case "upgrade":      return <Sparkles size={16} className="text-amber-500" />
    default:             return <Bell size={16} className="text-(--muted-foreground)" />
  }
}

function getNotificationBg(type: string) {
  switch (type) {
    case "recurring":    return "bg-blue-100 dark:bg-blue-950"
    case "budget_80":    return "bg-amber-100 dark:bg-amber-950"
    case "budget_100":   return "bg-red-100 dark:bg-red-950"
    case "welcome":      return "bg-emerald-100 dark:bg-emerald-950"
    case "password_changed": return "bg-purple-100 dark:bg-purple-950"
    case "upgrade":      return "bg-amber-100 dark:bg-amber-950"
    default:             return "bg-(--secondary)"
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationItem({ notification, onUpdate, showDelete = false }: Props) {
  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification._id)
      onUpdate()
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteNotification(notification._id)
    onUpdate()
  }

  const content = (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
        !notification.read
          ? "bg-(--secondary)"
          : "hover:bg-(--secondary)"
      }`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getNotificationBg(notification.type)}`}>
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${!notification.read ? "font-semibold text-(--foreground)" : "font-medium text-(--foreground)"}`}>
            {notification.title}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-(--primary) shrink-0" />
            )}
            {showDelete && (
              <button
                onClick={handleDelete}
                className="p-0.5 rounded hover:bg-(--border) text-(--muted-foreground) transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-(--muted-foreground) mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-(--muted-foreground) mt-1">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={handleClick}>
        {content}
      </Link>
    )
  }

  return content
}