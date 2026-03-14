import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
    try {
        const { data, error } = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: "seunfunmisore89@gmail.com", // 👈 put your real email here
            subject: "Resend Test",
            html: "<p>If you see this, Resend is working!</p>",
        })

        if (error) {
            return NextResponse.json({ error }, { status: 400 })
        }

        return NextResponse.json({ success: true, data })
    } catch (err) {
        return NextResponse.json({ err }, { status: 500 })
    }
}
