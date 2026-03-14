import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SpendWise | Smart Personal Finance Tracker",
  description:
    "SpendWise helps you take control of your money — track income and expenses, set budget goals, and visualize your spending habits with an intuitive dashboard.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.ico",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={`${inter.className} bg-(--background) text-(--foreground)`}
      >
        <SessionProvider>
          <ThemeProvider>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}