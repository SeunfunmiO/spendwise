import mongoose, { Schema, Document, Model } from "mongoose"

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId
    title: string
    amount: number
    type: "income" | "expense"
    category: string
    date: Date
    note?: string
    isRecurring: boolean
    recurringInterval?: "daily" | "weekly" | "monthly"
    createdAt: Date
    updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        type: {
            type: String,
            enum: ["income", "expense"],
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        note: {
            type: String,
            trim: true,
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        recurringInterval: {
            type: String,
            enum: ["daily", "weekly", "monthly"],
        },
    },
    { timestamps: true }
)

TransactionSchema.index({ userId: 1, date: -1 })

const Transaction: Model<ITransaction> =
    mongoose.models.Transaction ||
    mongoose.model<ITransaction>("Transaction", TransactionSchema)

export default Transaction