// ============================================================
// types/expense.ts
// This file defines ALL the TypeScript types for our app.
// TypeScript types act like a "contract" - they tell us
// exactly what shape our data must have.
// ============================================================

// -- EXPENSE CATEGORY --
// A "union type" = only these exact string values are allowed.
// If you try to use "gym" it will show an error!
export type ExpenseCategory =
  | "food"
  | "transport"
  | "housing"
  | "health"
  | "entertainment"
  | "education"
  | "shopping"
  | "other";

// -- EXPENSE --
// An "interface" defines the shape of an object.
// Every expense in our app must have these fields.
export interface Expense {
  id: string; // Unique ID for each expense (e.g. "abc123")
  title: string; // Name of the expense (e.g. "Pizza")
  amount: number; // Amount in CENTS to avoid decimals (e.g. 1500 = ₹15.00)
  category: ExpenseCategory; // Must be one of the allowed categories above
  date: string; // Date in format "YYYY-MM-DD" (e.g. "2024-01-15")
  note?: string; // Optional extra note (the ? means it's not required)
  createdAt: string; // When this record was created (ISO date string)
}

// -- MONTHLY BUDGET --
// Stores how much you want to spend in a given month.
export interface MonthlyBudget {
  month: string; // Format: "YYYY-MM" (e.g. "2024-01")
  amount: number; // Budget in CENTS (e.g. 50000 = ₹500.00)
}

// -- EXPENSE FILTERS --
// Used to filter the expense list by various criteria.
export interface ExpenseFilters {
  category: ExpenseCategory | "all"; // "all" means show every category
  month: string; // "YYYY-MM" format, or "" to show all months
  search: string; // Text search (matches expense title)
  minAmount: number | null; // Minimum amount filter (null = no limit)
  maxAmount: number | null; // Maximum amount filter (null = no limit)
}

// -- EXPENSE SUMMARY --
// A calculated summary used on the Dashboard page.
export interface ExpenseSummary {
  totalSpent: number; // Total money spent this month (cents)
  totalBudget: number; // Your budget for this month (cents)
  remaining: number; // Budget - Total Spent
  byCategory: Record<ExpenseCategory, number>; // Spending per category (cents)
  // Record<K, V> means: an object where keys are K and values are V
  // e.g. { food: 3000, transport: 1500, ... }
}
