import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
    name: string
    email: string
    password?: string
    image?: string
    currency: string
    language: string
    plan: "free" | "premium"
    paystackCustomerId?: string,
    role:string,
    createdAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
        },
        image: {
            type: String,
        },
        currency: {
            type: String,
            default: "NGN",
        },
        language: {
            type: String,
            enum: ["en", "es", "fr", "ar", "pt"],
            default: "en",
        },
        plan: {
            type: String,
            enum: ["free", "premium"],
            default: "free",
        },
        paystackCustomerId: {
            type: String,
        },
        role:{
            type:String,
            enum:["admin","user"],
            default:"user"
        }
    },
    { timestamps: true }
)

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User