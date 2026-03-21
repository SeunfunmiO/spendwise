"use server"
import connectDb from "@/lib/mongodb"
import User from "@/models/User"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/types"

export async function verifyPaystackPayment(
    reference: string
): Promise<ActionResult> {
    try {
        const session = await auth()
        if (!session?.user?.email) throw new Error("Unauthorized")

        // Verify with Paystack API
        const res = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        )

        const data = await res.json()

        if (!data.status || data.data?.status !== "success") {
            return { success: false, error: "Payment verification failed" }
        }

        await connectDb()

        await User.findOneAndUpdate(
            { email: session.user.email },
            {
                plan: "premium",
                paystackCustomerId: data.data?.customer?.customer_code,
            }
        )

        revalidatePath("/")
        revalidatePath("/upgrade")
        revalidatePath("/settings")

        return { success: true, message: "Payment verified successfully" }
    } catch (error) {
        console.error("verifyPaystackPayment error:", error)
        return { success: false, error: "Failed to verify payment" }
    }
}

export async function getUserPlan(): Promise<ActionResult<{ plan: string }>> {
    try {
        const session = await auth()
        if (!session?.user?.email) throw new Error("Unauthorized")

        await connectDb()
        const user = await User.findOne({ email: session.user.email })
        if (!user) throw new Error("User not found")

        return { success: true, data: { plan: user.plan } }
    } catch (error) {
        console.error("getUserPlan error:", error)
        return { success: false, error: "Failed to get plan" }
    }
}