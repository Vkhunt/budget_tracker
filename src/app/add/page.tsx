"use client";

// ============================================================
// app/add/page.tsx  ← ADD EXPENSE PAGE
//
// A simple client page that renders the ExpenseForm.
// When the form is submitted, ExpenseForm dispatches
// createExpense thunk → POST /api/expenses → adds to Redux.
// ============================================================

import Link from "next/link";
import ExpenseForm from "@/components/ExpenseForm";

export default function AddExpensePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back link */}
      <Link
        href="/expenses"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6"
      >
        ← Back to Expenses
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        ➕ Add New Expense
      </h1>

      {/*
        ExpenseForm with NO initialValues = Add Mode
        After save it navigates to /expenses automatically.
      */}
      <ExpenseForm />

      {/* Amounts are entered in normal ₹/$ — no need to convert! */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        💡 Enter the amount in regular currency — e.g. type{" "}
        <strong>1500</strong> for ₹1500
      </p>
    </div>
  );
}
