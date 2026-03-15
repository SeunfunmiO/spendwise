import mongoose, { Schema, Document, Model } from "mongoose"

export interface IBudget extends Document {
    userId: mongoose.Types.ObjectId
    category: string
    limit: number
    period: "weekly" | "monthly" | "annual"
    month: string        // e.g. "2026-03" for monthly
    week: string         // e.g. "2026-W11" for weekly
    year: string         // e.g. "2026" for annual
    createdAt: Date
    updatedAt: Date
}

const BudgetSchema = new Schema<IBudget>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        limit: {
            type: Number,
            required: true,
            min: 0,
        },
        period: {
            type: String,
            enum: ["weekly", "monthly", "annual"],
            default: "monthly",
        },
        month: {
            type: String,
        },
        week: {
            type: String,
        },
        year: {
            type: String,
        },
    },
    { timestamps: true }
)

BudgetSchema.index({ userId: 1, category: 1, period: 1, month: 1 })

const Budget: Model<IBudget> =
    mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema)

export default Budget