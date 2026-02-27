// ============================================================
// hooks/useFilteredExpenses.ts
//
// What this hook does:
// Reads expenses and the active filters from Redux,
// then applies ALL filters and returns the matching expenses.
//
// Usage in a component:
//   const { filteredExpenses, count } = useFilteredExpenses();
//   // filteredExpenses = expenses matching current filters
//   // count = how many matched
// ============================================================

import { useAppSelector } from "./useAppSelector";
import { Expense } from "@/types/expense";

// The shape of what this hook returns
interface FilteredExpensesResult {
  filteredExpenses: Expense[]; // Only the expenses that match all filters
  count: number; // How many matched (same as filteredExpenses.length)
}

export function useFilteredExpenses(): FilteredExpensesResult {
  // ---- Read from Redux store ----
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const filters = useAppSelector((state) => state.expenses.filters);
  // filters = { category, month, search, minAmount, maxAmount }

  // ---- Apply filters one by one ----
  // We start with ALL expenses and keep narrowing down.
  let result = [...expenses]; // Copy the array so we don't modify the original

  // ---- Filter 1: CATEGORY ----
  // Skip this filter if category is "all" (show everything)
  if (filters.category && filters.category !== "all") {
    result = result.filter(
      (expense) => expense.category === filters.category,
      // Keep only expenses whose category matches the selected one
    );
  }

  // ---- Filter 2: MONTH ----
  // Skip if month is "" (empty = show all months)
  if (filters.month) {
    result = result.filter(
      (expense) => expense.date.startsWith(filters.month),
      // e.g. "2025-01-15".startsWith("2025-01") → true ✅
    );
  }

  // ---- Filter 3: SEARCH TEXT ----
  // Skip if search is "" (empty = no search active)
  if (filters.search.trim()) {
    // Convert to lowercase for case-insensitive comparison
    // "Netflix".toLowerCase() → "netflix"
    const searchLower = filters.search.toLowerCase().trim();

    result = result.filter(
      (expense) => expense.title.toLowerCase().includes(searchLower),
      // .includes() → true if the title CONTAINS the search word
      // e.g. "Netflix Subscription".includes("netflix") → true ✅
    );
  }

  // ---- Filter 4: MIN AMOUNT ----
  // null means no minimum limit
  if (filters.minAmount !== null) {
    result = result.filter(
      (expense) => expense.amount >= filters.minAmount!,
      // Keep only expenses where amount is >= minAmount
      // The "!" after filters.minAmount tells TypeScript "I know it's not null here"
    );
  }

  // ---- Filter 5: MAX AMOUNT ----
  // null means no maximum limit
  if (filters.maxAmount !== null) {
    result = result.filter(
      (expense) => expense.amount <= filters.maxAmount!,
      // Keep only expenses where amount is <= maxAmount
    );
  }

  // ---- Sort by date descending (newest first) ----
  result.sort((a, b) => {
    // new Date("2025-01-15").getTime() → number of milliseconds since 1970
    // Larger number = more recent date
    return new Date(b.date).getTime() - new Date(a.date).getTime();
    // b - a = descending order (biggest first = newest first)
  });

  return {
    filteredExpenses: result,
    count: result.length, // Convenience: same as filteredExpenses.length
  };
}
