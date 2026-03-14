import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig: NextAuthConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const { pathname } = nextUrl

            const isAuthPage =
                pathname.startsWith("/login") ||
                pathname.startsWith("/register")

            const isDashboard =
                pathname === "/" ||
                pathname.startsWith("/transactions") ||
                pathname.startsWith("/budgets") ||
                pathname.startsWith("/reports") ||
                pathname.startsWith("/settings") ||
                pathname.startsWith("/upgrade")

            if (isDashboard && !isLoggedIn) return false
            if (isAuthPage && isLoggedIn) return Response.redirect(new URL("/", nextUrl))

            return true
        },
    },
}