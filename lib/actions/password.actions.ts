"use server"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { sendPasswordResetEmail } from "../email"
import { ActionResult } from "@/types"
import connectDb from "../mongodb"
import User from "@/models/User"

// ---- FORGOT PASSWORD ----
export async function forgotPassword(
    email: string
): Promise<ActionResult> {
    try {
        await connectDb()

        const user = await User.findOne({ email: email.toLowerCase() })

        // Always return success even if user not found
        // This prevents email enumeration attacks
        if (!user) {
            return { success: true }
        }

        // Google OAuth users don't have a password
        if (!user.password) {
            return {
                success: false,
                error: "This account uses Google sign in. Please sign in with Google.",
            }
        }

        // Generate secure random token
        const resetToken = crypto.randomBytes(32).toString("hex")

        // Set expiry to 15 minutes from now
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000)

        // Save token to user
        await User.findByIdAndUpdate(user._id, {
            resetToken,
            resetTokenExpiry,
        })

        // Build reset link
        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

        // Send email
        await sendPasswordResetEmail(user.email, resetLink)

        return { success: true }
    } catch (error) {
        console.error("forgotPassword error:", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}

// ---- RESET PASSWORD ----
export async function resetPassword(
    token: string,
    password: string
): Promise<ActionResult> {
    try {
        await connectDb()

        // Find user with valid unexpired token
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
        })

        if (!user) {
            return {
                success: false,
                error: "Reset link is invalid or has expired. Please request a new one.",
            }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Update password and clear token
        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        })

        return { success: true, message: "Password reset successfully" }
    } catch (error) {
        console.error("resetPassword error:", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}

// ---- VERIFY TOKEN (check if token is valid before showing form) ----
export async function verifyResetToken(
    token: string
): Promise<ActionResult> {
    try {
        await connectDb()

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
        })

        if (!user) {
            return {
                success: false,
                error: "Reset link is invalid or has expired.",
            }
        }

        return { success: true }
    } catch (error) {
        console.error("verifyResetToken error:", error)
        return { success: false, error: "Something went wrong." }
    }
}