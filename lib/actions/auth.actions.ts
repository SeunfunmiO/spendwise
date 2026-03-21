"use server"
import bcrypt from "bcryptjs"
import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import User from "@/models/User"
import { RegisterResult, SignInResult } from "@/types"
import { sendWelcomeEmail } from "../email"
import connectDb from "../mongodb"
import { createNotification } from "../notifications"



// ---- REGISTER ----
export async function registerUser(formData: {
    name: string
    email: string
    password: string
}): Promise<RegisterResult> {
    const { name, email, password } = formData

    if (!name || !email || !password) {
        return { success: false, error: "All fields are required" }
    }

    if (name.trim().length < 2) {
        return { success: false, error: "Name must be at least 2 characters" }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return { success: false, error: "Please enter a valid email address" }
    }

    if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" }
    }

    try {
        await connectDb()

        const existingUser = await User.findOne({ email: email.toLowerCase() })

        if (existingUser) {
            return {
                success: false,
                error: "An account with this email already exists",
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const newUser = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            currency: "NGN",
            language: "en",
            plan: "free",
        })

        await sendWelcomeEmail(newUser.name, newUser.email)
        await createNotification({
            userId: newUser._id,
            type: "welcome",
            title: "Welcome to SpendWise! 🎉",
            message: "Your account has been created successfully. Start tracking your finances!",
            link: "/",
        })

        return { success: true, message: "Account created successfully" }
    } catch (error) {
        console.error("Register error:", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}

// ---- LOGIN ----
export async function loginUser(formData: {
    email: string
    password: string
}): Promise<SignInResult> {
    const { email, password } = formData

    if (!email || !password) {
        return { success: false, error: "Email and password are required" }
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        return { success: true }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { success: false, error: "Incorrect email or password" }
                default:
                    return { success: false, error: "Something went wrong. Try again." }
            }
        }
        return { success: false, error: "Something went wrong. Try again." }
    }
}

// ---- LOGOUT ----
export async function logoutUser() {
    await signOut({ redirectTo: "/login" })
}

