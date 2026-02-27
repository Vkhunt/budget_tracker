// ============================================================
// hooks/useExpenseSummary.ts
//
// What this hook does:
// Reads ALL expenses and budgets from the Redux store,
// then calculates a summary for a specific month.
//
// Usage in a component:
//   const summary = useExpenseSummary("2025-01");
//   console.log(summary.totalSpent); // total spent in January 2025
// ============================================================

import { useAppSelector } from "./useAppSelector";
import { ExpenseCategory, ExpenseSummary } from "@/types/expense";

// All ExpenseCategory values in one array (used for building byCategory)
const ALL_CATEGORIES: ExpenseCategory[] = [
  "food",
  "transport",
  "housing",
  "health",
  "entertainment",
  "education",
  "shopping",
  "other",
];

export function useExpenseSummary(month: string): ExpenseSummary {
  // ---- Read from Redux store ----
  // useAppSelector reads a piece of the Redux state.
  // The arrow function picks WHICH part we want.
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const budgets = useAppSelector((state) => state.budget.budgets);

  // ---- Step 1: Filter expenses for this specific month ----
  // We only want expenses whose date starts with "YYYY-MM"
  // e.g. "2025-01-15".startsWith("2025-01") → true ✅
  const monthlyExpenses = expenses.filter((expense) =>
    expense.date.startsWith(month),
  );

  // ---- Step 2: Calculate total spent ----
  // .reduce() loops through the array and builds up a single value.
  // We start at 0 and keep adding each expense's amount.
  const totalSpent = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0, // ← Starting value (accumulator starts at 0)
  );

  // ---- Step 3: Get total budget for this month ----
  // Find the budget whose month matches our target month
  const budgetEntry = budgets.find((b) => b.month === month);
  const totalBudget = budgetEntry?.amount ?? 0;
  // budgetEntry?.amount → if budgetEntry exists, give me .amount
  // ?? 0              → if it's undefined/null, use 0 instead

  // ---- Step 4: Calculate remaining ----
  const remaining = totalBudget - totalSpent;
  // Can be negative! (means you've gone over budget)

  // ---- Step 5: Calculate spending by category ----
  // Start with all categories set to 0
  // Record<ExpenseCategory, number> means: object with category keys and number values
  const byCategory = ALL_CATEGORIES.reduce<Record<ExpenseCategory, number>>(
    (acc, category) => {
      // For each category, sum up all expenses in that category for this month
      acc[category] = monthlyExpenses
        .filter((e) => e.category === category) // Only this category
        .reduce((sum, e) => sum + e.amount, 0); // Sum their amounts
      return acc;
    },
    {} as Record<ExpenseCategory, number>, // Start with an empty object
  );

  // ---- Return the full summary ----
  return {
    totalSpent,
    totalBudget,
    remaining,
    byCategory,
  };
}
