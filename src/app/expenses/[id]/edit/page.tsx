"use client";

// ============================================================
// app/expenses/[id]/edit/page.tsx  ← EDIT EXPENSE PAGE
//
// This is a CLIENT component because:
//   1. We need useParams() to read the [id] from the URL
//   2. We dispatch Redux actions for loading the expense
//   3. We use useAppSelector to read expense from store
//
// It pre-fills the ExpenseForm with the existing expense data.
// ============================================================

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchExpenses, setSelectedExpense } from "@/store";
import ExpenseForm from "@/components/ExpenseForm";
import Link from "next/link";

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get the id from the URL: /expenses/abc-123/edit → "abc-123"
  const id = params.id as string;

  // ---- Read expenses from Redux ----
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const status = useAppSelector((state) => state.expenses.status);

  // Find the expense we want to edit
  const expense = expenses.find((e) => e.id === id);

  // ---- Load expenses if the store is empty ----
  // This happens if the user navigates directly to the edit URL
  // without going through /expenses first.
  useEffect(() => {
    if (expenses.length === 0 && status === "idle") {
      dispatch(fetchExpenses()); // Load all expenses into Redux
    }
  }, [expenses.length, status, dispatch]);

  // ---- Set this expense as "selected" in Redux ----
  useEffect(() => {
    if (expense) {
      dispatch(setSelectedExpense(expense));
    }
    // Cleanup: clear selectedExpense when we leave this page
    return () => {
      dispatch(setSelectedExpense(null));
    };
  }, [expense, dispatch]);

  // ---- Loading state: expenses are being fetched ----
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="animate-spin text-3xl mb-3">⏳</div>
          <p className="text-gray-500">Loading expense...</p>
        </div>
      </div>
    );
  }

  // ---- Not found: expense doesn't exist ----
  if (expenses.length > 0 && !expense) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Expense Not Found
          </h2>
          <p className="text-gray-500 mb-4">
            No expense with ID &ldquo;{id}&rdquo; exists.
          </p>
          <Link
            href="/expenses"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            ← Back to Expenses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back link */}
      <Link
        href={`/expenses/${id}`}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6"
      >
        ← Back to Expense
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">✏️ Edit Expense</h1>

      {/*
        ExpenseForm with:
          initialValues = existing expense data (pre-fills the form)
          expenseId     = tells form it's in EDIT mode
        After saving → navigates to /expenses/[id]
      */}
      <ExpenseForm initialValues={expense} expenseId={id} />
    </div>
  );
}
