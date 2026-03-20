import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
    interface User {
        id: string
        name: string
        email: string
        image?: string
        plan: string
        currency: string
        language: string
        role: string
        dateFormat?: string
        budgetAlerts?: boolean
    }

    interface Session {
        user: User
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        plan: string
        currency: string
        language: string
        role: string
        dateFormat?: string
        budgetAlerts?: boolean
        picture?: string
    }
}