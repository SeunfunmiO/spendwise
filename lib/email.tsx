import "server-only"
import resend from "@/lib/resend"
import WelcomeEmail from "@/emails/welcomeEmail"


export async function sendWelcomeEmail(name: string, email: string) {
    try {
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: email,
            subject: `Welcome to SpendWise`,
            react: WelcomeEmail({ name }),
        })
    } catch (error) {
        // We log but don't throw — a failed welcome email
        // should never block the user from registering
        console.error("Failed to send welcome email:", error)
    }
}