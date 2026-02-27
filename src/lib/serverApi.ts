// ============================================================
// lib/serverApi.ts  ← SERVER-SIDE API HELPERS (FIXED)
//
// ROOT CAUSE OF THE BUG:
// Next.js runs Server Components and API routes in SEPARATE
// module instances. This means the in-memory array in lib/data.ts
// is DIFFERENT between a server component and an API route!
//
//   API route updates:    lib/data.ts [instance A] ← POST adds here
//   serverApi.ts reads:   lib/data.ts [instance B] ← never sees the add!
//
// FIX: Use fetch() to call our own API routes instead of importing
// lib/data.ts directly. API routes always use the SAME instance,
// so all reads and writes go through the same in-memory store.
// ============================================================

import { Expense, MonthlyBudget } from "@/types/expense";

// Build the base URL for fetch calls inside Server Components.
// Priority order:
//   1. NEXT_PUBLIC_BASE_URL  → manually set in .env.local or Vercel dashboard
//   2. VERCEL_URL            → automatically set by Vercel on every deploy (no manual setup!)
//   3. localhost:3000        → dev fallback
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    // VERCEL_URL is set automatically as "your-project.vercel.app" (no https://)
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000"; // Local development
}

// ---- Get all expenses for a specific month ----
// Calls GET /api/expenses?month=YYYY-MM with cache: 'no-store'
export async function fetchExpensesForMonth(month: string): Promise<Expense[]> {
  const url = `${getBaseUrl()}/api/expenses?month=${month}`;

  const response = await fetch(url, {
    cache: "no-store", // Always fetch fresh — never use cached response
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch expenses: ${response.status}`);
  }

  const json = await response.json();
  return (json.data as Expense[]) ?? [];
}

// ---- Get the budget for a specific month ----
// Calls GET /api/budget?month=YYYY-MM with cache: 'no-store'
export async function fetchBudgetForMonth(
  month: string,
): Promise<MonthlyBudget> {
  const url = `${getBaseUrl()}/api/budget?month=${month}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    // Don't throw — a missing budget is normal, return 0
    return { month, amount: 0 };
  }

  const json = await response.json();
  // Return the budget data, or 0 if not set for this month
  return (json.data as MonthlyBudget) ?? { month, amount: 0 };
}

// ---- Helper: get today's month as "YYYY-MM" ----
export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
  // e.g. "2026-02"
}
