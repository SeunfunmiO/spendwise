import "server-only"
import transporter from "@/lib/nodemailer"

const logoUrl = "https://spendwise-smoky.vercel.app/logo.svg"
const year = new Date().getFullYear()

function baseTemplate(content: string) {
    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f6f9fc; padding: 40px 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: #10b981; padding: 24px 40px;">
          <img src="${logoUrl}" alt="SpendWise" width="160" height="36" style="display: block;" />
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
          ${content}
        </div>

        <!-- Footer -->
        <div style="padding: 0 40px 32px;">
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px;" />
          <p style="font-size: 13px; color: #9ca3af; margin: 0 0 4px;">
            — The SpendWise Team · ${year}
          </p>
        </div>

      </div>
    </div>
  `
}

// ---- Welcome Email ----
export async function sendWelcomeEmail(name: string, email: string) {
    const content = `
    <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 16px;">
      Welcome, ${name}! 🎉
    </h2>
    <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 16px;">
      You've just taken the first step toward smarter money management.
      SpendWise helps you track your income and expenses, set budget goals,
      and visualize your spending habits — all in one place.
    </p>
    <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 16px;">
      Here's what you can do right away:
    </p>
    <p style="font-size: 15px; color: #374151; line-height: 1.8; margin: 0 0 4px;">✅ Add your first transaction</p>
    <p style="font-size: 15px; color: #374151; line-height: 1.8; margin: 0 0 4px;">📊 Set a monthly budget goal</p>
    <p style="font-size: 15px; color: #374151; line-height: 1.8; margin: 0 0 32px;">📈 View your spending breakdown</p>
    <div style="text-align: center; margin: 0 0 32px;">
      <a href="${process.env.NEXTAUTH_URL}" style="background: #10b981; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">
        Get Started →
      </a>
    </div>
    <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0;">
      If you didn't create this account, you can safely ignore this email.
    </p>
  `

    try {
        const info = await transporter.sendMail({
            from: `"SpendWise" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Welcome to SpendWise",
            html: baseTemplate(content),
        })
        console.log("Welcome email sent:", info.messageId)
    } catch (error) {
        console.error("Failed to send welcome email:", error)
    }
}

// ---- Password Reset Email ----
export async function sendPasswordResetEmail(email: string, resetLink: string) {
    const content = `
    <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 16px;">
      Reset Your Password
    </h2>
    <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 16px;">
      We received a request to reset your SpendWise password. Click the button
      below to create a new password.
    </p>
    <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 32px;">
      This link will expire in <strong>1 hour</strong>.
    </p>
    <div style="text-align: center; margin: 0 0 32px;">
      <a href="${resetLink}" style="background: #10b981; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">
        Reset Password →
      </a>
    </div>
    <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0;">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will not be changed.
    </p>
  `

    try {
        const info = await transporter.sendMail({
            from: `"SpendWise" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Reset Your SpendWise Password 🔐",
            html: baseTemplate(content),
        })
        console.log("Password reset email sent:", info.messageId)
    } catch (error) {
        console.error("Failed to send password reset email:", error)
    }
}