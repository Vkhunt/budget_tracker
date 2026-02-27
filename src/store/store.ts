// ============================================================
// store/store.ts  ← REDUX STORE CONFIGURATION
//
// The store is the central hub of all app state.
// It combines all slices (expenses + budget) into one object.
// ============================================================

import { configureStore } from "@reduxjs/toolkit";
import expensesReducer from "./expensesSlice";
import budgetReducer from "./budgetSlice";

export const store = configureStore({
  reducer: {
    expenses: expensesReducer, // state.expenses → managed by expensesSlice
    budget: budgetReducer, // state.budget   → managed by budgetSlice
  },
});

// ---- TypeScript helpers ----

// RootState = shape of the ENTIRE Redux state
// { expenses: ExpenseState, budget: BudgetState }
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch = type of the dispatch function
export type AppDispatch = typeof store.dispatch;
