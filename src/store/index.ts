// ============================================================
// store/index.ts  ← BARREL EXPORT FILE
//
// Import everything you need from just ONE place:
//   import { store, fetchExpenses, addExpense } from "@/store"
// ============================================================

// Store + TypeScript types
export { store } from "./store";
export type { RootState, AppDispatch } from "./store";

// ---- Expense sync actions ----
export {
  setExpenses,
  addExpense,
  updateExpense,
  removeExpense,
  setFilters,
  clearFilters,
  setSelectedExpense,
  setStatus,
  setError,
} from "./expensesSlice";

// ---- Expense async thunks ----
export {
  fetchExpenses, // GET /api/expenses (with filters)
  createExpense, // POST /api/expenses
  editExpense, // PUT /api/expenses/[id]
  deleteExpense, // DELETE /api/expenses/[id]
} from "./expensesSlice";

// ---- Budget sync actions ----
export { setBudgets, setMonthlyBudget } from "./budgetSlice";

// ---- Budget async thunks ----
export {
  fetchBudget, // GET /api/budget?month=...
  setBudgetThunk, // POST /api/budget
} from "./budgetSlice";
