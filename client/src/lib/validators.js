import { z } from "zod";

// ── Auth Schemas ──────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

// ── Transaction Schema ────────────────────────────────

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    required_error: "Select a transaction type",
  }),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .min(0.01, "Amount must be greater than 0"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description cannot exceed 200 characters"),
  category: z
    .string()
    .min(1, "Category is required"),
  date: z
    .string()
    .min(1, "Date is required"),
});

// ── Budget Schema ─────────────────────────────────────

export const budgetSchema = z.object({
  category: z
    .string()
    .min(1, "Category is required"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .min(1, "Budget limit must be at least 1"),
});

// ── Goal Schema ───────────────────────────────────────

export const goalSchema = z.object({
  name: z
    .string()
    .min(1, "Goal name is required")
    .max(60, "Goal name is too long"),
  targetAmount: z
    .number({ invalid_type_error: "Target amount must be a number" })
    .min(1, "Target must be at least 1"),
  targetDate: z
    .string()
    .min(1, "Target date is required"),
  color: z
    .string()
    .min(1, "Pick a color"),
});

export const addFundsSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .min(1, "Amount must be at least 1"),
});
