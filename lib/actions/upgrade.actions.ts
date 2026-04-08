"use server"
import connectDb from "@/lib/mongodb"
import User from "@/models/User"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/types"
import { createNotification } from "../notifications"

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

        const upgradedUser = await User.findOne({ email: session.user.email })
        if (upgradedUser) {
            await createNotification({
                userId: upgradedUser._id,
                type: "upgrade",
                title: "Welcome to Premium! 🎉",
                message: "You now have access to all SpendWise premium features including unlimited transactions, advanced reports, and CSV export.",
                link: "/upgrade",
            })
        }
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
export async function cancelSubscription(): Promise<ActionResult> {
    try {
        const session = await auth()
        if (!session?.user?.email) throw new Error("Unauthorized")

        await connectDb()
        const user = await User.findOne({ email: session.user.email })
        if (!user) throw new Error("User not found")

        if (!user.paystackCustomerId) {
            return { success: false, error: "No active subscription found" }
        }

        // Get subscriptions from Paystack
        const res = await fetch(
            `https://api.paystack.co/subscription?customer=${user.paystackCustomerId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        )

        const data = await res.json()

        if (!data.status || !data.data?.length) {
            return { success: false, error: "No active subscription found" }
        }

        // Find active subscription
        const activeSubscription = data.data.find(
            (sub: any) => sub.status === "active"
        )

        if (!activeSubscription) {
            return { success: false, error: "No active subscription found" }
        }

        // Disable subscription on Paystack
        const cancelRes = await fetch(
            `https://api.paystack.co/subscription/disable`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: activeSubscription.subscription_code,
                    token: activeSubscription.email_token,
                }),
            }
        )

        const cancelData = await cancelRes.json()

        if (!cancelData.status) {
            return { success: false, error: "Failed to cancel subscription" }
        }

        // Downgrade user to free
        await User.findOneAndUpdate(
            { email: session.user.email },
            { plan: "free" }
        )

        // Create notification
        await createNotification({
            userId: user._id,
            type: "upgrade",
            title: "Subscription Cancelled",
            message: "Your Premium subscription has been cancelled. You've been moved to the free plan.",
            link: "/upgrade",
        })

        revalidatePath("/upgrade")
        revalidatePath("/")

        return { success: true, message: "Subscription cancelled successfully" }
    } catch (error) {
        console.error("cancelSubscription error:", error)
        return { success: false, error: "Failed to cancel subscription" }
    }
}