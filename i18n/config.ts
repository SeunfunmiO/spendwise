export const locales = ["en", "es", "fr", "ar", "pt"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"