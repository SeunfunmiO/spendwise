import "server-only"
import React from "react"
import resend from "@/lib/resend"
import WelcomeEmail from "@/emails/WelcomeEmail"

export async function sendWelcomeEmail(name: string, email: string) {
    const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: email,
        subject: "Welcome to SpendWise",
        react: <WelcomeEmail name={name} />,
    })

    if (error) {
        console.error("Resend error:", JSON.stringify(error))
        return
    }

    console.log("Email sent successfully:", data?.id)
}
// from: process.env.RESEND_FROM_EMAIL!,