export function formatCurrency(amount: number, currency: string = "NGN"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(amount)
}

export function formatDate(date: string, format: string = "DD/MM/YYYY"): string {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()

    switch (format) {
        case "MM/DD/YYYY": return `${month}/${day}/${year}`
        case "YYYY/MM/DD": return `${year}/${month}/${day}`
        default: return `${day}/${month}/${year}` // DD/MM/YYYY
    }
}
export function cn(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(" ")
}