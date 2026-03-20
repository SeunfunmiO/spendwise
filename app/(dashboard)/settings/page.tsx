"use client"
import { useState } from "react"
import { useTranslations } from "next-intl"
import ProfileTab from "@/components/settings/Profile"
import SecurityTab from "@/components/settings/Security"
import PreferencesTab from "@/components/settings/Preferences"

type Tab = "profile" | "security" | "preferences"

export default function SettingsPage() {
    const t = useTranslations("settings")
    const [activeTab, setActiveTab] = useState<Tab>("profile")

    const TABS: { key: Tab; label: string }[] = [
        { key: "profile", label: t("profile") },
        { key: "security", label: t("security") },
        { key: "preferences", label: t("preferences") },
    ]

    return (
        <div className="py-6 max-w-2xl">

            {/* Header */}
            <h2 className="text-2xl font-bold text-(--foreground) mb-6">
                {t("title")}
            </h2>

            {/* Tabs */}
            <div className="flex rounded-lg border border-(--border) overflow-hidden mb-8 w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key
                                ? "bg-(--primary) text-white"
                                : "text-(--muted-foreground) hover:bg-(--secondary)"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "preferences" && <PreferencesTab />}

        </div>
    )
}