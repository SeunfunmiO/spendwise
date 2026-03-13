export interface jwtPayload {
    _id?: string
    iat?: number
    exp?: number
    success: boolean
}

export type RegisterResult =
    | { success: true; message: string }
    | { success: false; error: string }

export type SignInResult =
    | { success: true }
    | { success: false; error: string }