import { z } from "zod"

// ---- Auth ----
export const registerSchema = z
    .object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name is too long"),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Please enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .refine((val) => /[A-Z]/.test(val), {
                message: "Password must contain at least one uppercase letter",
            })
            .refine((val) => /[0-9]/.test(val), {
                message: "Password must contain at least one number",
            })
            .refine((val) => /[^a-zA-Z0-9]/.test(val), {
                message: "Password must contain at least one special character",
            }),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

// ---- Transaction ----
export const transactionSchema = z
    .object({
        title: z
            .string()
            .min(1, "Title is required")
            .max(100, "Title is too long"),
        amount: z
            .number({ error: "Amount must be a number" })
            .positive("Amount must be greater than zero"),
        type: z.enum(["income", "expense"] as const, {
            error: "Please select a type",
        }),
        category: z.string().min(1, "Category is required"),
        customCategory: z.string().optional(),
        date: z.string().min(1, "Date is required"),
        note: z.string().max(300, "Note is too long").optional(),
        isRecurring: z.boolean(),
        recurringInterval: z
            .enum(["daily", "weekly", "monthly"] as const)
            .optional(),
    })
    .refine(
        (data) => {
            if (data.category === "Other") {
                return !!data.customCategory?.trim()
            }
            return true
        },
        {
            message: "Please describe the category",
            path: ["customCategory"],
        }
    )
// ---- Inferred Types ----
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TransactionInput = z.infer<typeof transactionSchema>