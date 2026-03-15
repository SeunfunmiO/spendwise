import { LucideIcon } from "lucide-react"

interface Props {
    title: string
    value: string
    subtitle?: string
    icon: LucideIcon
    iconColor: string
    iconBg: string
    trend?: "up" | "down" | "neutral"
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor,
    iconBg,
    trend,
}: Props) {
    return (
        <div className="bg-(--card) rounded-xl border border-(--border) p-6">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-(--muted-foreground)">{title}</p>
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: iconBg }}
                >
                    <Icon size={20} style={{ color: iconColor }} />
                </div>
            </div>
            <p className="text-2xl font-bold text-(--foreground)">{value}</p>
            {subtitle && (
                <p className={`text-xs mt-1 ${trend === "up"
                        ? "text-emerald-500"
                        : trend === "down"
                            ? "text-red-500"
                            : "text-(--muted-foreground)"
                    }`}>
                    {subtitle}
                </p>
            )}
        </div>
    )
}