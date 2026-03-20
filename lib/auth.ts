import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import connectDb from "@/lib/mongodb"
import User from "@/models/User"
import { authConfig } from "./auth.config"
import { sendWelcomeEmail } from "./email"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        ...authConfig.providers,
        Credentials({
            credentials: {
                email: { type: "email" },
                password: { type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                await connectDb()

                const user = await User.findOne({ email: credentials.email })

                if (!user) throw new Error("No account found with this email")
                if (!user.password) throw new Error("Please sign in with Google")

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!isValid) throw new Error("Incorrect password")

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    plan: user.plan,
                    currency: user.currency,
                    language: user.language,
                    role: user.role,
                }
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await connectDb()
                if (!user.email || !user.name) return false

                const existingUser = await User.findOne({ email: user.email })

                if (!existingUser) {
                    await User.create({
                        name: user.name,
                        email: user.email,
                        image: user.image ?? "",
                        currency: "NGN",
                        language: "en",
                        plan: "free",
                        role: "user",
                    })

                    // 👇 Send welcome email only on first Google sign in
                    await sendWelcomeEmail(user.name, user.email)
                }
            }
            return true
        },
       
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id
                token.plan = (user as any).plan
                token.currency = (user as any).currency
                token.language = (user as any).language
                token.role = (user as any).role
                token.image = (user as any).image
            }

            if (trigger === "update") {
                console.log("🔄 JWT update triggered for:", token.email)
                await connectDb()
                const dbUser = await User.findOne({ email: token.email })
                if (dbUser) {
                    console.log("✅ DB user found:", dbUser.name, dbUser.image)
                    token.name = dbUser.name
                    token.picture = dbUser.image
                    token.plan = dbUser.plan
                    token.currency = dbUser.currency
                    token.language = dbUser.language
                    token.role = dbUser.role
                    token.dateFormat = dbUser.dateFormat
                    token.budgetAlerts = dbUser.budgetAlerts
                } else {
                    console.log("❌ No DB user found for email:", token.email)
                }
            }

            return token
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.name = token.name as string
                session.user.image = token.picture as string
                    ; (session.user as any).plan = token.plan
                    ; (session.user as any).currency = token.currency
                    ; (session.user as any).language = token.language
                    ; (session.user as any).role = token.role
                    ; (session.user as any).dateFormat = token.dateFormat
                    ; (session.user as any).budgetAlerts = token.budgetAlerts
            }
            return session
        },
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
})