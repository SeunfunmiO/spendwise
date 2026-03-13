import { NextRequest, NextResponse, ProxyConfig } from "next/server";
import { auth } from "./lib/session";




//function
export default async function proxy(req: NextRequest) {

    const { success } = await auth()

    if (!success) {
        return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    return NextResponse.next()
}

//config
export const config: ProxyConfig = {
    matcher: [
        '/budgets/:path*',
        '/reports/:path*',
        '/settings/:path*',
        '/transactions/:path*',
        '/upgrade',
    ],
}


// import { auth } from "@/lib/auth"
// import { NextResponse } from "next/server"

// export default auth((req) => {
//     const { nextUrl, auth: session } = req
//     const isLoggedIn = !!session

//     const isAuthPage =
//         nextUrl.pathname.startsWith("/login") ||
//         nextUrl.pathname.startsWith("/register")

//     const isDashboard =
//         nextUrl.pathname === "/" ||
//         nextUrl.pathname.startsWith("/transactions") ||
//         nextUrl.pathname.startsWith("/budgets") ||
//         nextUrl.pathname.startsWith("/reports") ||
//         nextUrl.pathname.startsWith("/settings") ||
//         nextUrl.pathname.startsWith("/upgrade")

//     if (isDashboard && !isLoggedIn) {
//         return NextResponse.redirect(new URL("/login", nextUrl))
//     }

//     if (isAuthPage && isLoggedIn) {
//         return NextResponse.redirect(new URL("/", nextUrl))
//     }

//     return NextResponse.next()
// })

// export const config = {
//     matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// }