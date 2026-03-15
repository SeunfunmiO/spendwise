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
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
})

export const resetPasswordSchema = z
    .object({
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

export const budgetSchema = z.object({
    category: z.string().min(1, "Category is required"),
    limit: z
        .number({ error: "Limit must be a number" })
        .positive("Limit must be greater than zero"),
    period: z.enum(["weekly", "monthly", "annual"] as const, {
        error: "Please select a period",
    }),
})

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name is too long"),
})

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
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
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

// ---- Inferred Types ----
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>