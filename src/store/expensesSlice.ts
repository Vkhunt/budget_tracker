// ============================================================
// store/expensesSlice.ts  ← EXPENSES SLICE WITH ASYNC THUNKS
//
// What is a "thunk"?
// A thunk is a function that does async work (like calling an API)
// BEFORE dispatching actions to update the Redux state.
//
// Normal flow:    dispatch(action) → state updates immediately
// Thunk flow:     dispatch(thunk) → calls API → THEN dispatches action
//
// We use createAsyncThunk() from Redux Toolkit to make this easy.
// It automatically handles 3 states: pending, fulfilled, rejected.
// ============================================================

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Expense, ExpenseFilters } from "@/types/expense";

// ============================================================
// STATE SHAPE (exact exam spec)
// ============================================================
interface ExpenseState {
  expenses: Expense[];
  filters: ExpenseFilters;
  selectedExpense: Expense | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Default filter values (show everything - no filters active)
const defaultFilters: ExpenseFilters = {
  category: "all",
  month: "",
  search: "",
  minAmount: null,
  maxAmount: null,
};

// Initial state when the app first loads
const initialState: ExpenseState = {
  expenses: [],
  filters: defaultFilters,
  selectedExpense: null,
  status: "idle",
  error: null,
};

// ============================================================
// ASYNC THUNKS
//
// createAsyncThunk("name", async (argument) => { ... })
//   - "name" is used in Redux DevTools to identify the action
//   - The async function does the actual API call
//   - Whatever you return becomes the "payload" in fulfilled case
// ============================================================

// ---- 1. fetchExpenses ----
// Calls GET /api/expenses (with optional filters in the URL)
// Usage: dispatch(fetchExpenses({ category: "food", month: "2025-01" }))
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses", // Action name shown in DevTools

  async (filters?: Partial<ExpenseFilters>) => {
    // Build the query string from filters
    // e.g. ?category=food&month=2025-01
    const params = new URLSearchParams();

    if (filters?.category && filters.category !== "all") {
      params.set("category", filters.category);
    }
    if (filters?.month) {
      params.set("month", filters.month);
    }
    if (filters?.search) {
      params.set("search", filters.search);
    }

    // Build the final URL
    const queryString = params.toString();
    const url = `/api/expenses${queryString ? `?${queryString}` : ""}`;
    // If no filters: "/api/expenses"
    // With filters:  "/api/expenses?category=food&month=2025-01"

    // fetch() calls the API and waits for the response
    const response = await fetch(url);

    if (!response.ok) {
      // .ok is false for 4xx and 5xx HTTP errors
      throw new Error("Failed to fetch expenses");
      // Throwing an error → thunk goes to "rejected" state
    }

    const json = await response.json(); // Parse the JSON response
    return json.data as Expense[]; // Return just the array
    // This returned value becomes action.payload in extraReducers below
  },
);

// ---- 2. createExpense ----
// Calls POST /api/expenses to add a new expense
// Usage: dispatch(createExpense({ title: "Pizza", amount: 1500, ... }))
export const createExpense = createAsyncThunk(
  "expenses/createExpense",

  async (newExpense: Omit<Expense, "id" | "createdAt">) => {
    // Omit<Expense, "id" | "createdAt"> means:
    // The Expense type BUT WITHOUT "id" and "createdAt"
    // (the server generates those, so we don't send them)

    const response = await fetch("/api/expenses", {
      method: "POST", // HTTP method
      headers: { "Content-Type": "application/json" }, // Tell server we're sending JSON
      body: JSON.stringify(newExpense), // Convert object to JSON string
    });

    if (!response.ok) {
      const json = await response.json();
      // Show the server's validation error message if available
      throw new Error(json.message || "Failed to create expense");
    }

    const json = await response.json();
    return json.data as Expense; // The created expense (with id and createdAt)
  },
);

// ---- 3. editExpense ----
// Calls PUT /api/expenses/[id] to update an existing expense
// Usage: dispatch(editExpense({ id: "abc", updates: { title: "New Title" } }))
export const editExpense = createAsyncThunk(
  "expenses/editExpense",

  async ({ id, updates }: { id: string; updates: Partial<Expense> }) => {
    // Destructuring: pulls "id" and "updates" from the argument object
    // Partial<Expense> = any fields of Expense (all optional)

    const response = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || "Failed to update expense");
    }

    const json = await response.json();
    return json.data as Expense; // The updated expense
  },
);

// ---- 4. deleteExpense ----
// Calls DELETE /api/expenses/[id] to remove an expense
// Usage: dispatch(deleteExpense("abc-123"))
export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",

  async (id: string) => {
    // id is just a string — the expense ID to delete

    const response = await fetch(`/api/expenses/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || "Failed to delete expense");
    }

    return id; // Return the ID so we know which one to remove from state
  },
);

// ============================================================
// CREATE THE SLICE
// ============================================================
const expensesSlice = createSlice({
  name: "expenses",
  initialState,

  // "reducers" = synchronous (instant) state changes
  reducers: {
    setExpenses(state, action: PayloadAction<Expense[]>) {
      state.expenses = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    addExpense(state, action: PayloadAction<Expense>) {
      state.expenses.push(action.payload);
    },
    updateExpense(state, action: PayloadAction<Expense>) {
      const index = state.expenses.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },
    removeExpense(state, action: PayloadAction<string>) {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
    },
    setFilters(state, action: PayloadAction<Partial<ExpenseFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = defaultFilters;
    },
    setSelectedExpense(state, action: PayloadAction<Expense | null>) {
      state.selectedExpense = action.payload;
    },
    setStatus(state, action: PayloadAction<ExpenseState["status"]>) {
      state.status = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.status = "failed";
    },
  },

  // "extraReducers" = handles the 3 states of each async thunk:
  //   pending   = thunk is still running (show a spinner)
  //   fulfilled = thunk succeeded (update state with data)
  //   rejected  = thunk failed (show error message)
  extraReducers: (builder) => {
    // ---- fetchExpenses ----
    builder
      .addCase(fetchExpenses.pending, (state) => {
        // API call just started
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        // API call succeeded — action.payload = the Expense[] we returned
        state.status = "succeeded";
        state.expenses = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        // API call failed — action.error.message = our thrown error
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch expenses";
      });

    // ---- createExpense ----
    builder
      .addCase(createExpense.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        // Add the newly created expense to the list
        state.expenses.push(action.payload);
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to create expense";
      });

    // ---- editExpense ----
    builder
      .addCase(editExpense.pending, (state) => {
        state.status = "loading";
      })
      .addCase(editExpense.fulfilled, (state, action) => {
        // Find the old expense and replace it with the updated one
        const index = state.expenses.findIndex(
          (e) => e.id === action.payload.id,
        );
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(editExpense.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to update expense";
      });

    // ---- deleteExpense ----
    builder
      .addCase(deleteExpense.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        // action.payload = the id we returned from the thunk
        state.expenses = state.expenses.filter((e) => e.id !== action.payload);
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to delete expense";
      });
  },
});

// Export synchronous action creators
export const {
  setExpenses,
  addExpense,
  updateExpense,
  removeExpense,
  setFilters,
  clearFilters,
  setSelectedExpense,
  setStatus,
  setError,
} = expensesSlice.actions;

export default expensesSlice.reducer;
