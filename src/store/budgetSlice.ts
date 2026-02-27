// ============================================================
// store/budgetSlice.ts  ← BUDGET SLICE WITH ASYNC THUNKS
//
// State shape matches exact exam spec:
//   { budgets: MonthlyBudget[], status: "idle"|"loading"|"succeeded"|"failed" }
//
// Two async thunks:
//   fetchBudget(month)          → GET /api/budget?month=...
//   setBudget({ month, amount}) → POST /api/budget
// ============================================================

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MonthlyBudget } from "@/types/expense";

// ============================================================
// STATE SHAPE (exact exam spec — no error field here)
// ============================================================
interface BudgetState {
  budgets: MonthlyBudget[]; // One budget entry per month
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: BudgetState = {
  budgets: [],
  status: "idle",
};

// ============================================================
// ASYNC THUNKS
// ============================================================

// ---- fetchBudget(month) ----
// Calls GET /api/budget?month=2025-01
// Usage: dispatch(fetchBudget("2025-01"))
export const fetchBudget = createAsyncThunk(
  "budget/fetchBudget",

  async (month: string) => {
    // Build URL with the month query parameter
    const url = `/api/budget?month=${month}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch budget");
    }

    const json = await response.json();
    return json.data as MonthlyBudget; // Returns { month, amount }
  },
);

// ---- setBudget({ month, amount }) ----
// Calls POST /api/budget to create or update a monthly budget
// Usage: dispatch(setBudgetThunk({ month: "2025-01", amount: 500000 }))
export const setBudgetThunk = createAsyncThunk(
  "budget/setBudget",

  async (budgetData: MonthlyBudget) => {
    // budgetData = { month: "2025-01", amount: 500000 }

    const response = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(budgetData), // Send as JSON
    });

    if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || "Failed to save budget");
    }

    const json = await response.json();
    return json.data as MonthlyBudget; // The saved budget
  },
);

// ============================================================
// CREATE THE SLICE
// ============================================================
const budgetSlice = createSlice({
  name: "budget",
  initialState,

  // Synchronous reducers (instant updates)
  reducers: {
    // Replace all budgets at once (used when loading from API)
    setBudgets(state, action: PayloadAction<MonthlyBudget[]>) {
      state.budgets = action.payload;
      state.status = "succeeded";
    },

    // Set or update one month's budget directly in state
    setMonthlyBudget(state, action: PayloadAction<MonthlyBudget>) {
      const { month, amount } = action.payload;
      const existingIndex = state.budgets.findIndex((b) => b.month === month);

      if (existingIndex !== -1) {
        state.budgets[existingIndex].amount = amount; // Update existing
      } else {
        state.budgets.push(action.payload); // Add new month
      }
    },
  },

  // Async thunk handlers
  extraReducers: (builder) => {
    // ---- fetchBudget ----
    builder
      .addCase(fetchBudget.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        // action.payload = { month, amount } from the API
        state.status = "succeeded";

        // Add or update the fetched budget in the array
        const existingIndex = state.budgets.findIndex(
          (b) => b.month === action.payload.month,
        );

        if (existingIndex !== -1) {
          state.budgets[existingIndex] = action.payload;
        } else {
          state.budgets.push(action.payload);
        }
      })
      .addCase(fetchBudget.rejected, (state) => {
        state.status = "failed";
      });

    // ---- setBudgetThunk ----
    builder
      .addCase(setBudgetThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(setBudgetThunk.fulfilled, (state, action) => {
        // Same logic: add or update the saved budget
        state.status = "succeeded";
        const existingIndex = state.budgets.findIndex(
          (b) => b.month === action.payload.month,
        );

        if (existingIndex !== -1) {
          state.budgets[existingIndex] = action.payload;
        } else {
          state.budgets.push(action.payload);
        }
      })
      .addCase(setBudgetThunk.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { setBudgets, setMonthlyBudget } = budgetSlice.actions;
export default budgetSlice.reducer;
