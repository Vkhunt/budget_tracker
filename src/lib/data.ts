// ============================================================
// lib/data.ts  ← IN-MEMORY DATA STORE
//
// This file acts as our "database" for now.
// It keeps all expenses in a simple JavaScript array.
//
// ⚠️ IMPORTANT FOR BEGINNERS:
// "In-memory" means the data lives inside the running server.
// If you restart the server (npm run dev), all data is LOST.
// That's fine for now — we'll add a real database later.
//
// We use "let" so the array can be changed (items added/removed).
// ============================================================

import { Expense, MonthlyBudget } from "@/types/expense";

// ---- EXPENSES STORAGE ----
// This is a simple array that holds all expense objects.
// Think of it like a spreadsheet in memory.
// We start with some sample data so the app isn't empty.
let expenses: Expense[] = [
  {
    id: "1",
    title: "Grocery Shopping",
    amount: 150000, // 150000 cents = ₹1500.00
    category: "food",
    date: "2026-02-15",
    note: "Weekly groceries from supermarket",
    createdAt: "2026-02-15T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Metro Card Recharge",
    amount: 50000, // 50000 cents = ₹500.00
    category: "transport",
    date: "2026-02-10",
    createdAt: "2026-02-10T09:00:00.000Z",
  },
  {
    id: "3",
    title: "Netflix Subscription",
    amount: 64900, // 64900 cents = ₹649.00
    category: "entertainment",
    date: "2026-02-05",
    note: "Monthly streaming subscription",
    createdAt: "2026-02-05T08:00:00.000Z",
  },
  {
    id: "4",
    title: "Electricity Bill",
    amount: 320000, // ₹3200.00
    category: "housing",
    date: "2026-02-20",
    note: "February electricity bill",
    createdAt: "2026-02-20T11:00:00.000Z",
  },
  {
    id: "5",
    title: "Gym Membership",
    amount: 180000, // ₹1800.00
    category: "health",
    date: "2026-02-01",
    createdAt: "2026-02-01T07:00:00.000Z",
  },
];

// ---- BUDGET STORAGE ----
// Holds the monthly budget for each month.
const budgets: MonthlyBudget[] = [
  {
    month: "2026-02", // February 2026 (current month)
    amount: 1000000, // 1000000 cents = ₹10,000.00 budget
  },
];

// ============================================================
// EXPENSE FUNCTIONS
// These are helper functions to read and change the expenses.
// We export them so the API routes can use them.
// ============================================================

// Get ALL expenses (returns a copy of the array)
export function getAllExpenses(): Expense[] {
  // We return a spread copy [...expenses] so the original
  // array isn't accidentally changed from outside this file.
  return [...expenses];
}

// Find ONE expense by its id
// Returns the expense if found, or undefined if not found
export function getExpenseById(id: string): Expense | undefined {
  return expenses.find((expense) => expense.id === id);
  // .find() loops through and returns the FIRST item that matches
}

// Add a new expense to the array
export function addExpense(newExpense: Expense): Expense {
  expenses.push(newExpense); // Add to the end of the array
  return newExpense;
}

// Update an existing expense by id
// Returns the updated expense, or null if not found
export function updateExpense(
  id: string,
  updatedData: Partial<Expense>,
): Expense | null {
  // Find the position (index) of the expense in the array
  const index = expenses.findIndex((expense) => expense.id === id);

  if (index === -1) {
    // -1 means "not found"
    return null;
  }

  // Merge old data with new data using spread operator (...)
  // Example: { ...oldExpense, title: "New Title" }
  expenses[index] = { ...expenses[index], ...updatedData };
  return expenses[index];
}

// Delete an expense by id
// Returns true if deleted, false if not found
export function deleteExpense(id: string): boolean {
  const originalLength = expenses.length;

  // .filter() creates a NEW array WITHOUT the matching item
  expenses = expenses.filter((expense) => expense.id !== id);

  // If the length changed, deletion was successful
  return expenses.length !== originalLength;
}

// ============================================================
// BUDGET FUNCTIONS
// ============================================================

// Get the budget for a specific month
// Returns the budget, or null if no budget is set for that month
export function getBudgetByMonth(month: string): MonthlyBudget | null {
  return budgets.find((b) => b.month === month) ?? null;
  // ?? null means: "if the result is undefined, return null instead"
}

// Set or update the budget for a month
export function setBudget(newBudget: MonthlyBudget): MonthlyBudget {
  // Check if a budget already exists for this month
  const existingIndex = budgets.findIndex((b) => b.month === newBudget.month);

  if (existingIndex !== -1) {
    // Budget already exists → update it
    budgets[existingIndex] = newBudget;
  } else {
    // No budget yet for this month → add a new one
    budgets.push(newBudget);
  }

  return newBudget;
}
