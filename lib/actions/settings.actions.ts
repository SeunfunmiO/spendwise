"use server"
import bcrypt from "bcryptjs"
import connectDb from "@/lib/mongodb"
import User from "@/models/User"
import { auth, unstable_update } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/types"
import cloudinary from "@/lib/cloudinary"
import { sendPasswordChangedEmail } from "../email"
import { createNotification } from "../notifications"

async function getSessionUser() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")
    await connectDb()
    const user = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")
    return user
}

export async function getUserProfile(): Promise<ActionResult<{
    name: string
    email: string
    image: string
    currency: string
    language: string
    dateFormat: string
    budgetAlerts: boolean
    plan: string
    role: string
}>> {
    try {
        const user = await getSessionUser()
        const dbUser = await User.findById(user._id)
        if (!dbUser) return { success: false, error: "User not found" }

        return {
            success: true,
            data: {
                name: dbUser.name,
                email: dbUser.email,
                image: dbUser.image ?? "",
                currency: dbUser.currency ?? "NGN",
                language: dbUser.language ?? "en",
                dateFormat: dbUser.dateFormat ?? "DD/MM/YYYY",
                budgetAlerts: dbUser.budgetAlerts ?? true,
                plan: dbUser.plan ?? "free",
                role: dbUser.role ?? "user",
            }
        }
    } catch (error) {
        console.error("getUserProfile error:", error)
        return { success: false, error: "Failed to fetch profile" }
    }
}

// ---- UPDATE PROFILE ----
export async function updateProfile(data: {
    name: string
    image?: string
}): Promise<ActionResult> {
    try {
        const user = await getSessionUser()

        if (!data.name || data.name.trim().length < 2) {
            return { success: false, error: "Name must be at least 2 characters" }
        }

        await User.findByIdAndUpdate(user._id, {
            name: data.name.trim(),
            ...(data.image && { image: data.image }),
        })

        revalidatePath("/settings")
        return { success: true, message: "Profile updated successfully" }
    } catch (error) {
        console.error("updateProfile error:", error)
        return { success: false, error: "Failed to update profile" }
    }
}


// ---- CHANGE PASSWORD ----
export async function changePassword(data: {
    currentPassword: string
    newPassword: string
}): Promise<ActionResult> {
    try {
        const user = await getSessionUser()

        if (!user.password) {
            return {
                success: false,
                error: "This account uses Google sign in. Password cannot be changed.",
            }
        }

        const isValid = await bcrypt.compare(data.currentPassword, user.password)
        if (!isValid) {
            return { success: false, error: "Current password is incorrect" }
        }

        if (data.newPassword.length < 8) {
            return { success: false, error: "New password must be at least 8 characters" }
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, 12)
        await User.findByIdAndUpdate(user._id, { password: hashedPassword })

        await sendPasswordChangedEmail (user.name, user.email)

        await createNotification({
            userId: user._id,
            type: "password_changed",
            title: "Password Changed",
            message: "Your password was changed successfully. If you didn't do this, reset your password immediately.",
            link: "/settings",
        })

        return { success: true, message: "Password changed successfully" }
    } catch (error) {
        console.error("changePassword error:", error)
        return { success: false, error: "Failed to change password" }
    }
}

// ---- UPDATE PREFERENCES ----
export async function updatePreferences(data: {
    currency?: string
    language?: string
    dateFormat?: string
    theme?: string
    budgetAlerts?: boolean
}): Promise<ActionResult> {
    try {
        const user = await getSessionUser()

        await User.findByIdAndUpdate(user._id, {
            ...(data.currency && { currency: data.currency }),
            ...(data.language && { language: data.language }),
            ...(data.dateFormat && { dateFormat: data.dateFormat }),
            ...(data.theme && { theme: data.theme }),
            ...(data.budgetAlerts !== undefined && { budgetAlerts: data.budgetAlerts }),
        })

        revalidatePath("/settings")
        revalidatePath("/")
        return { success: true, message: "Preferences updated successfully" }
    } catch (error) {
        console.error("updatePreferences error:", error)
        return { success: false, error: "Failed to update preferences" }
    }
}

export async function deleteAccount(): Promise<ActionResult> {
    try {
        const user = await getSessionUser()

        if (user.image && user.image.includes("cloudinary")) {
            const publicId = user.image.split("/").pop()?.split(".")[0]
            if (publicId) {
                await cloudinary.uploader.destroy(`spendwise/avatars/${publicId}`)
            }
        }

        const Transaction = (await import("@/models/Transaction")).default
        const Budget = (await import("@/models/Budget")).default

        await Transaction.deleteMany({ userId: user._id })
        await Budget.deleteMany({ userId: user._id })
        await User.findByIdAndDelete(user._id)

        // 👇 Clear all cookies
        const { cookies } = await import("next/headers")
        const cookieStore = await cookies()
        cookieStore.delete("next-auth.session-token")
        cookieStore.delete("authjs.session-token")
        cookieStore.delete("locale")

        return { success: true, message: "Account deleted successfully" }
    } catch (error) {
        console.error("deleteAccount error:", error)
        return { success: false, error: "Failed to delete account" }
    }
}

export async function refreshSession(): Promise<ActionResult> {
    try {
        const user = await getSessionUser()
        await connectDb()
        const dbUser = await User.findById(user._id)
        if (!dbUser) return { success: false, error: "User not found" }

        await unstable_update({
            user: {
                name: dbUser.name,
                image: dbUser.image,
                currency: dbUser.currency,
                language: dbUser.language,
                dateFormat: dbUser.dateFormat,
                budgetAlerts: dbUser.budgetAlerts,
                plan: dbUser.plan,
                role: dbUser.role,
            }
        })

        return { success: true }
    } catch (error) {
        console.error("refreshSession error:", error)
        return { success: false, error: "Failed to refresh session" }
    }
}