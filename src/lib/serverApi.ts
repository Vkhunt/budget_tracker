// ============================================================
// lib/serverApi.ts  ← SERVER-SIDE API HELPERS
//
// On Vercel, Server Components should NOT use fetch() to call
// their own API routes. Doing so drops cookies (causing proxy blocks)
// and creates slow lambda-to-lambda network requests.
//
// Instead, Server Components should read directly from the database
// (or in our case, the lib/data.ts file).
// ============================================================

import { Expense, MonthlyBudget } from "@/types/expense";
import { getAllExpenses, getBudgetByMonth } from "@/lib/data";

// ---- Get all expenses for a specific month ----
export async function fetchExpensesForMonth(month: string): Promise<Expense[]> {
  // Read directly from our in-memory "database"
  const allExpenses = getAllExpenses();

  // Filter by month (same logic as the API route)
  const filtered = allExpenses.filter((expense) =>
    expense.date.startsWith(month),
  );

  // Sort descending by date
  filtered.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return filtered;
}

// ---- Get the budget for a specific month ----
export async function fetchBudgetForMonth(
  month: string,
): Promise<MonthlyBudget> {
  // Read directly from data store
  const budget = getBudgetByMonth(month);

  // Return early if null
  if (!budget) {
    return { month, amount: 0 };
  }

  return budget;
}

// ---- Helper: get today's month as "YYYY-MM" ----
export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}
