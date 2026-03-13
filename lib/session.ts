import { jwtVerify, SignJWT } from "jose";
import "server-only"
import { cookies } from "next/headers";
import User from "@/models/User";
import { jwtPayload } from "@/types";
import connectDb from "./mongodb";



const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET);

export const encrypt = (payload: { _id: string }) => {
    const token = new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime("2d")
        .sign(encodedKey)

    return token
}


export const decrypt = async (token: string): Promise<jwtPayload> => {
    try {
        const { payload } = await jwtVerify(token, encodedKey, { algorithms: ['HS256'] })
        return { ...payload, success: true }
    } catch (error) {
        console.log('Error decrypting token : ', error);

        return { success: false }
    }
}

export const auth = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        return {
            success: false,
        }
    }

    const { _id, success } = await decrypt(token)

    if (!success) {
        return { success: false }
    }

    return { _id, success: true }
}

export const verifyUser = async () => {
    const { success, _id } = await auth()

    if (!success) {
        return { success: false }
    }
    await connectDb()
    const user = await User.findById(_id)

    if (!user) {
        return { success: false }
    }

    return { success: true, user }
}


