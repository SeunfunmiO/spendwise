import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import connectDb from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const signature = req.headers.get("x-paystack-signature")

        // Verify webhook signature
        const hash = crypto
            .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
            .update(body)
            .digest("hex")

        if (hash !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
        }

        const event = JSON.parse(body)
        console.log("Paystack webhook event:", event.event)

        await connectDb()

        switch (event.event) {
            case "charge.success":
            case "subscription.create": {
                const email = event.data?.customer?.email
                if (email) {
                    await User.findOneAndUpdate(
                        { email },
                        {
                            plan: "premium",
                            paystackCustomerId: event.data?.customer?.customer_code,
                        }
                    )
                    console.log("✅ User upgraded to premium:", email)
                }
                break
            }

            case "subscription.disable":
            case "subscription.not_renew": {
                const email = event.data?.customer?.email
                if (email) {
                    await User.findOneAndUpdate({ email }, { plan: "free" })
                    console.log("⬇️ User downgraded to free:", email)
                }
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
    }
}