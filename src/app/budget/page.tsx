"use client"; // ← Client component — uses useState, useEffect, and form interactions

// ============================================================
// app/budget/page.tsx  ← MONTHLY BUDGET PAGE
//
// This page lets the user:
//   1. See a list of all months where a budget has been set
//   2. See actual spending vs. budget for each month
//   3. Set or update the budget for any month via a form
// ============================================================

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchBudget, setBudgetThunk, fetchExpenses } from "@/store";
import { useCurrency } from "@/context/CurrencyContext";
import BudgetProgressBar from "@/components/BudgetProgressBar";

// ============================================================
// Helper: get the last 6 months as "YYYY-MM" strings
// e.g. ["2025-01", "2024-12", "2024-11", ...]
// ============================================================
function getRecentMonths(count: number): string[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Create a new date going back i months
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    // padStart(2, "0") → turns "1" into "01" so we always get 2 digits
    months.push(month);
  }

  return months; // Returns newest first
}

// ============================================================
// Helper: format "YYYY-MM" → "January 2025"
// ============================================================
function formatMonthLabel(month: string): string {
  return new Date(`${month}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function BudgetPage() {
  const dispatch = useAppDispatch();
  const { formatAmount } = useCurrency();

  // Read Redux state
  const budgets = useAppSelector((state) => state.budget.budgets);
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const budgetStatus = useAppSelector((state) => state.budget.status);

  // ---- Form state ----
  const [selectedMonth, setSelectedMonth] = useState<string>(
    () => new Date().toISOString().slice(0, 7), // Default: current month
  );
  const [amountInput, setAmountInput] = useState<string>("");
  // We use a string for the input so the user can type freely,
  // and convert to number only when submitting.

  const [formMessage, setFormMessage] = useState<string>("");
  // Shows success/error feedback after saving

  // ---- Load data on first render ----
  useEffect(() => {
    // Load all expenses (for showing actual spending vs. budget)
    dispatch(fetchExpenses());

    // Load budgets for the last 6 months
    const months = getRecentMonths(6);
    months.forEach((month) => {
      dispatch(fetchBudget(month));
    });
  }, [dispatch]);
  // [dispatch] = dependency array — runs once on mount (dispatch never changes)

  // ---- When selectedMonth changes, pre-fill the amount input ----
  useEffect(() => {
    const existing = budgets.find((b) => b.month === selectedMonth);
    setAmountInput(existing ? String(existing.amount) : "");
    // If a budget already exists for this month, pre-fill with its amount
    setFormMessage(""); // Clear any previous message
  }, [selectedMonth, budgets]);

  // ---- Handle form submit ----
  const handleSave = () => {
    // Validate: amount must be a positive whole number
    const parsed = parseInt(amountInput, 10);
    if (isNaN(parsed) || parsed < 0) {
      setFormMessage("❌ Please enter a valid amount (in cents, 0 or more)");
      return;
    }

    // Dispatch the thunk to POST /api/budget
    dispatch(setBudgetThunk({ month: selectedMonth, amount: parsed }))
      .unwrap()
      // .unwrap() lets us catch errors from the thunk
      .then(() => {
        setFormMessage(
          `✅ Budget saved for ${formatMonthLabel(selectedMonth)}!`,
        );
      })
      .catch(() => {
        setFormMessage("❌ Failed to save budget. Please try again.");
      });
  };

  // ---- Helper: calculate total spent for a specific month ----
  const getSpentForMonth = (month: string): number => {
    return expenses
      .filter((e) => e.date.startsWith(month)) // Only this month
      .reduce((sum, e) => sum + e.amount, 0); // Sum amounts
  };

  // Get 6 months to display in the summary list
  const recentMonths = getRecentMonths(6);

  // Only show months that have a budget set
  const monthsWithBudget = recentMonths.filter((m) =>
    budgets.some((b) => b.month === m && b.amount > 0),
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* ---- Page Header ---- */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        🎯 Monthly Budget
      </h1>
      <p className="text-gray-500 mb-8">
        Set how much you want to spend each month and track your progress.
      </p>

      {/* ============================================================
          SECTION 1: SET / UPDATE BUDGET FORM
      ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Set Budget for a Month
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Month picker (type="month" shows a native month picker) */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1 font-medium">
              📅 Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Budget amount input (in cents) */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1 font-medium">
              💰 Budget Amount (in cents)
            </label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 500000 = ₹5000"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                setFormMessage(""); // Clear message on new input
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {/* Show preview of the formatted amount */}
            {amountInput && !isNaN(parseInt(amountInput)) && (
              <p className="text-xs text-blue-600 mt-1">
                = {formatAmount(parseInt(amountInput))}
              </p>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={budgetStatus === "loading"}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
          >
            {budgetStatus === "loading" ? "Saving..." : "💾 Save Budget"}
          </button>

          {/* Success/error feedback message */}
          {formMessage && (
            <p className="text-sm font-medium text-gray-700">{formMessage}</p>
          )}
        </div>
      </div>

      {/* ============================================================
          SECTION 2: MONTHLY BUDGET SUMMARY LIST
          (read-only — shows spending vs. budget per month)
      ============================================================ */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Budget Overview
      </h2>

      {monthsWithBudget.length === 0 ? (
        // Empty state — no budgets set yet
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
          <p className="text-lg">🎯 No budgets set yet</p>
          <p className="text-sm mt-1">
            Use the form above to set your first monthly budget.
          </p>
        </div>
      ) : (
        // List of months with budgets + progress bars
        <div className="space-y-4">
          {monthsWithBudget.map((month) => {
            const budget = budgets.find((b) => b.month === month);
            const spent = getSpentForMonth(month);

            return (
              <div key={month}>
                {/* BudgetProgressBar shows the visual progress */}
                <BudgetProgressBar
                  spent={spent}
                  budget={budget?.amount ?? 0}
                  month={month}
                />

                {/* Read-only text summary below each bar */}
                <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
                  <span>Spent: {formatAmount(spent)}</span>
                  <span>Budget: {formatAmount(budget?.amount ?? 0)}</span>
                  <span
                    className={
                      spent > (budget?.amount ?? 0)
                        ? "text-red-500 font-medium"
                        : "text-green-600 font-medium"
                    }
                  >
                    {spent > (budget?.amount ?? 0)
                      ? `Over by ${formatAmount(spent - (budget?.amount ?? 0))}`
                      : `Saved ${formatAmount((budget?.amount ?? 0) - spent)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
