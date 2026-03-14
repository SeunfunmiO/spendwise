import "server-only"
import React from "react"
import resend from "@/lib/resend"
import WelcomeEmail from "@/emails/WelcomeEmail"




export async function sendWelcomeEmail(name: string, email: string) {
    try {
        await resend.emails.send({
            // from: process.env.RESEND_FROM_EMAIL!,
            from: "onboarding@resend.dev",
            to: email,
            subject: "Welcome to SpendWise",
            react: <WelcomeEmail name={name} />,
        })
    } catch (error) {
        console.error("Failed to send welcome email:", error)
    }
}