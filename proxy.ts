import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { locales, defaultLocale } from "@/i18n/config"
import { authConfig } from "./lib/auth.cnfig"

const { auth } = NextAuth(authConfig)

export default auth((req: any) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const { pathname } = nextUrl

    // Set locale cookie if not already set
    const localeCookie = req.cookies.get("locale")?.value
    const validLocale =
        localeCookie && locales.includes(localeCookie as any)
            ? localeCookie
            : defaultLocale

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

    if (isDashboard && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl))
    }

    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL("/", nextUrl))
    }

    const response = NextResponse.next()

    // Persist locale cookie
    if (!localeCookie) {
        response.cookies.set("locale", validLocale, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
        })
    }

    return response
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}