"use server"
import connectDb from "@/lib/mongodb"
import Notification from "@/models/Notification"
import User from "@/models/User"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/types"

export interface NotificationData {
    _id: string
    type: string
    title: string
    message: string
    read: boolean
    link?: string
    createdAt: string
}

async function getSessionUser() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")
    await connectDb()
    const user = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")
    return user
}

function serialize(doc: any): NotificationData {
    const obj = doc.toObject ? doc.toObject() : doc
    return {
        ...obj,
        _id: obj._id.toString(),
        createdAt: obj.createdAt.toISOString(),
    }
}

// ---- GET ALL ----
export async function getNotifications(): Promise<ActionResult<NotificationData[]>> {
    try {
        const user = await getSessionUser()
        const notifications = await Notification.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(50)
        return { success: true, data: notifications.map(serialize) }
    } catch (error) {
        console.error("getNotifications error:", error)
        return { success: false, error: "Failed to fetch notifications" }
    }
}

// ---- GET UNREAD COUNT ----
export async function getUnreadCount(): Promise<ActionResult<{ count: number }>> {
    try {
        const user = await getSessionUser()
        const count = await Notification.countDocuments({
            userId: user._id,
            read: false,
        })
        return { success: true, data: { count } }
    } catch (error) {
        console.error("getUnreadCount error:", error)
        return { success: false, error: "Failed to get unread count" }
    }
}

// ---- MARK ONE AS READ ----
export async function markAsRead(id: string): Promise<ActionResult> {
    try {
        const user = await getSessionUser()
        await Notification.findOneAndUpdate(
            { _id: id, userId: user._id },
            { read: true }
        )
        revalidatePath("/notifications")
        return { success: true }
    } catch (error) {
        console.error("markAsRead error:", error)
        return { success: false, error: "Failed to mark as read" }
    }
}

// ---- MARK ALL AS READ ----
export async function markAllAsRead(): Promise<ActionResult> {
    try {
        const user = await getSessionUser()
        await Notification.updateMany(
            { userId: user._id, read: false },
            { read: true }
        )
        revalidatePath("/notifications")
        return { success: true }
    } catch (error) {
        console.error("markAllAsRead error:", error)
        return { success: false, error: "Failed to mark all as read" }
    }
}

// ---- DELETE ONE ----
export async function deleteNotification(id: string): Promise<ActionResult> {
    try {
        const user = await getSessionUser()
        await Notification.findOneAndDelete({ _id: id, userId: user._id })
        revalidatePath("/notifications")
        return { success: true }
    } catch (error) {
        console.error("deleteNotification error:", error)
        return { success: false, error: "Failed to delete notification" }
    }
}

// ---- CLEAR ALL ----
export async function clearAllNotifications(): Promise<ActionResult> {
    try {
        const user = await getSessionUser()
        await Notification.deleteMany({ userId: user._id })
        revalidatePath("/notifications")
        return { success: true }
    } catch (error) {
        console.error("clearAllNotifications error:", error)
        return { success: false, error: "Failed to clear notifications" }
    }
}