import "server-only"
import connectDb from "@/lib/mongodb"
import Notification from "@/models/Notification"
import mongoose from "mongoose"
import type { INotification } from "@/models/Notification"

interface CreateNotificationInput {
    userId: mongoose.Types.ObjectId | string
    type: INotification["type"]
    title: string
    message: string
    link?: string
}


export async function createNotification(input: CreateNotificationInput) {
    try {
        await connectDb()
        await Notification.create(input)
    } catch (error) {
        console.error("createNotification error:", error)
    }
}