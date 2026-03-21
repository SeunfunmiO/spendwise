import { NextRequest, NextResponse } from "next/server"
import connectDb from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import User from "@/models/User"
import Budget from "@/models/Budget"
import { sendBudgetAlertEmail, sendRecurringTransactionEmail } from "@/lib/email"
import { createNotification } from "@/lib/notifications"

// Verify this is called by Vercel Cron and not a random request
function isAuthorized(req: NextRequest) {
    const authHeader = req.headers.get("authorization")
    return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        await connectDb()

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        // Find all recurring transactions
        const recurringTransactions = await Transaction.find({
            isRecurring: true,
            recurringInterval: { $exists: true },
        })

        let created = 0
        let skipped = 0

        for (const tx of recurringTransactions) {
            const lastDate = new Date(tx.date)

            // Calculate next due date based on interval
            let nextDueDate: Date

            if (tx.recurringInterval === "daily") {
                nextDueDate = new Date(lastDate)
                nextDueDate.setDate(nextDueDate.getDate() + 1)
            } else if (tx.recurringInterval === "weekly") {
                nextDueDate = new Date(lastDate)
                nextDueDate.setDate(nextDueDate.getDate() + 7)
            } else {
                // monthly
                nextDueDate = new Date(lastDate)
                nextDueDate.setMonth(nextDueDate.getMonth() + 1)
            }

            // Normalize to start of day for comparison
            const nextDueDateNormalized = new Date(
                nextDueDate.getFullYear(),
                nextDueDate.getMonth(),
                nextDueDate.getDate()
            )

            // Only create if due today
            if (nextDueDateNormalized.getTime() !== today.getTime()) {
                skipped++
                continue
            }

            // Check if already created today (avoid duplicates)
            const alreadyExists = await Transaction.findOne({
                userId: tx.userId,
                title: tx.title,
                amount: tx.amount,
                type: tx.type,
                category: tx.category,
                isRecurring: true,
                date: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                },
            })

            if (alreadyExists) {
                skipped++
                continue
            }

            // Create new transaction
            const newTransaction = await Transaction.create({
                userId: tx.userId,
                title: tx.title,
                amount: tx.amount,
                type: tx.type,
                category: tx.category,
                date: today,
                note: tx.note,
                isRecurring: true,
                recurringInterval: tx.recurringInterval,
            })
            
            created++
            
            // ---- Send email notification to user ----
            const user = await User.findById(tx.userId)
            if (user && tx.recurringInterval) {
                await sendRecurringTransactionEmail(
                    user.name,
                    user.email,
                    newTransaction.title,
                    newTransaction.amount,
                    user.currency ?? "NGN",
                    tx.recurringInterval
                )
            }
            await createNotification({
                userId: tx.userId,
                type: "recurring",
                title: `Recurring Transaction — ${newTransaction.title}`,
                message: `Your ${tx.recurringInterval} transaction of ${new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: user?.currency ?? "NGN",
                }).format(newTransaction.amount)} has been automatically added.`,
                link: `/transactions/${newTransaction._id}`,
            })

            // Check budget alert for expense transactions
            if (newTransaction.type === "expense") {
                if (user?.plan === "premium" && user?.budgetAlerts) {
                    await checkBudgetAlertForCron(
                        tx.userId,
                        tx.category,
                        user.email,
                        user.name
                    )
                }
            }
        }

        console.log(`✅ Cron job completed: ${created} created, ${skipped} skipped`)

        return NextResponse.json({
            success: true,
            created,
            skipped,
            total: recurringTransactions.length,
        })
    } catch (error) {
        console.error("Cron job error:", error)
        return NextResponse.json({ error: "Cron job failed" }, { status: 500 })
    }
}

// ---- Budget alert helper for cron ----
async function checkBudgetAlertForCron(
    userId: any,
    category: string,
    userEmail: string,
    userName: string
) {
    try {
        const now = new Date()
        const budget = await Budget.findOne({ userId, category, period: "monthly" })
        if (!budget) return

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        const transactions = await Transaction.find({
            userId,
            category,
            type: "expense",
            date: { $gte: startOfMonth, $lte: endOfMonth },
        })

        const spent = transactions.reduce((sum, t) => sum + t.amount, 0)
        const percentage = (spent / budget.limit) * 100

        if (percentage >= 80 && percentage < 100 && !budget.alertSent80) {
            await sendBudgetAlertEmail(
                userName, userEmail, category, spent, budget.limit, Math.round(percentage)
            )
            await Budget.findByIdAndUpdate(budget._id, { alertSent80: true, alertSent100: false })
        } else if (percentage >= 100 && !budget.alertSent100) {
            await sendBudgetAlertEmail(
                userName, userEmail, category, spent, budget.limit, Math.round(percentage), true
            )
            await Budget.findByIdAndUpdate(budget._id, { alertSent100: true })
        }
    } catch (error) {
        console.error("Cron budget alert error:", error)
    }
}