"use client"
import { useEffect, useState } from "react"
import { getUserProfile } from "@/lib/actions/settings.actions"

interface UserPreferences {
    currency: string
    dateFormat: string
    language: string
}

export function useUserPreferences(): UserPreferences {
    const [preferences, setPreferences] = useState<UserPreferences>({
        currency: "NGN",
        dateFormat: "DD/MM/YYYY",
        language: "en",
    })

    useEffect(() => {
        const fetch = async () => {
            const result = await getUserProfile()
            if (result.success && result.data) {
                setPreferences({
                    currency: result.data.currency,
                    dateFormat: result.data.dateFormat,
                    language: result.data.language,
                })
            }
        }
        fetch()
    }, [])

    return preferences
}