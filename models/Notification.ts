import mongoose, { Schema, Document, Model } from "mongoose"

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId
    type: "recurring" | "budget_80" | "budget_100" | "welcome" | "password_changed" | "upgrade"
    title: string
    message: string
    read: boolean
    link?: string
    createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["recurring", "budget_80", "budget_100", "welcome", "password_changed", "upgrade"],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
        },
    },
    { timestamps: true }
)

NotificationSchema.index({ userId: 1, createdAt: -1 })
NotificationSchema.index({ userId: 1, read: 1 })

const Notification: Model<INotification> =
    mongoose.models.Notification ||
    mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification