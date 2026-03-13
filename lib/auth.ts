import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import User from "@/models/User"
import connectDb from "./mongodb"


export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required")
                }

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
                }
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await connectDb()

                // Guard against null values from Google
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
                }
            }
            return true
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.plan = (user as any).plan
                token.currency = (user as any).currency
                token.language = (user as any).language
            }
            return token
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                    ; (session.user as any).plan = token.plan
                    ; (session.user as any).currency = token.currency
                    ; (session.user as any).language = token.language
            }
            return session
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,
})