import { NextRequest, NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64, {
            folder: "spendwise/avatars",
            transformation: [
                { width: 200, height: 200, crop: "fill", gravity: "face" },
                { quality: "auto" },
            ],
        })

        return NextResponse.json({ url: result.secure_url })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}