import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in your .env.local file')
}

interface MongooseCache {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
}

declare global {
    var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }
global.mongooseCache = cached

async function connectDb(): Promise<typeof mongoose> {
    if (cached.conn) return cached.conn

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
        cached.promise = mongoose.connect(MONGODB_URI, opts)
    }

    try {
        cached.conn = await cached.promise
    } catch (err) {
        cached.promise = null
        throw err
    }

    return cached.conn
}

export default connectDb
