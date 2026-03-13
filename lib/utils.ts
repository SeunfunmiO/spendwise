export function formatCurrency(amount: number, currency: string = "NGN"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(amount)
}

export function formatDate(date: string): string {
    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(date))
}

export function cn(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(" ")
}