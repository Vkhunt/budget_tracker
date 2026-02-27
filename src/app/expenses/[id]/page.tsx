"use client";

// ============================================================
// app/expenses/[id]/page.tsx  ← EXPENSE DETAIL PAGE
//
// Shows full details of a single expense.
// Provides Edit and Delete actions.
// ============================================================

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchExpenses, deleteExpense, setSelectedExpense } from "@/store";
import { useCurrency } from "@/context/CurrencyContext";
import CategoryBadge from "@/components/CategoryBadge";
import Link from "next/link";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formatAmount } = useCurrency();

  const id = params.id as string;

  const expenses = useAppSelector((state) => state.expenses.expenses);
  const status = useAppSelector((state) => state.expenses.status);

  // Find the expense in Redux by ID
  const expense = expenses.find((e) => e.id === id);

  // Load expenses from API if the Redux store is empty
  useEffect(() => {
    if (expenses.length === 0 && status === "idle") {
      dispatch(fetchExpenses());
    }
  }, [expenses.length, status, dispatch]);

  // Track as the selected expense
  useEffect(() => {
    if (expense) dispatch(setSelectedExpense(expense));
    return () => {
      dispatch(setSelectedExpense(null));
    };
  }, [expense, dispatch]);

  // ---- Handle delete ----
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    await dispatch(deleteExpense(id));
    router.push("/expenses");
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center text-gray-400">
        <div className="animate-pulse text-3xl mb-2">⏳</div>
        <p>Loading expense...</p>
      </div>
    );
  }

  // Not found
  if (expenses.length > 0 && !expense) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Expense Not Found
        </h2>
        <Link
          href="/expenses"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Expenses
        </Link>
      </div>
    );
  }

  if (!expense) return null;

  // Format date nicely: "2025-01-15" → "January 15, 2025"
  const formattedDate = new Date(expense.date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const formattedCreatedAt = new Date(expense.createdAt).toLocaleString(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back link */}
      <Link
        href="/expenses"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6"
      >
        ← Back to Expenses
      </Link>

      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Colored header band based on category */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />

        <div className="p-6">
          {/* Title + Amount row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">
              {expense.title}
            </h1>
            <span className="text-2xl font-bold text-blue-700 shrink-0">
              {formatAmount(expense.amount)}
            </span>
          </div>

          {/* Badge + Date */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <CategoryBadge category={expense.category} size="md" />
            <span className="text-sm text-gray-500">📅 {formattedDate}</span>
          </div>

          {/* Detail rows */}
          <dl className="divide-y divide-gray-100">
            {/* Amount in cents */}
            <div className="py-3 flex justify-between text-sm">
              <dt className="text-gray-500 font-medium">Amount (cents)</dt>
              <dd className="text-gray-800 font-mono">
                {expense.amount.toLocaleString()} ¢
              </dd>
            </div>

            {/* Category */}
            <div className="py-3 flex justify-between text-sm">
              <dt className="text-gray-500 font-medium">Category</dt>
              <dd className="text-gray-800 capitalize">{expense.category}</dd>
            </div>

            {/* Date */}
            <div className="py-3 flex justify-between text-sm">
              <dt className="text-gray-500 font-medium">Date</dt>
              <dd className="text-gray-800">{formattedDate}</dd>
            </div>

            {/* Note (only if present) */}
            {expense.note && (
              <div className="py-3 text-sm">
                <dt className="text-gray-500 font-medium mb-1">Note</dt>
                <dd className="text-gray-700 bg-gray-50 rounded-lg p-3 italic">
                  {expense.note}
                </dd>
              </div>
            )}

            {/* Created at */}
            <div className="py-3 flex justify-between text-sm">
              <dt className="text-gray-500 font-medium">Created</dt>
              <dd className="text-gray-400 text-xs">{formattedCreatedAt}</dd>
            </div>

            {/* ID */}
            <div className="py-3 flex justify-between text-sm">
              <dt className="text-gray-500 font-medium">ID</dt>
              <dd className="text-gray-400 text-xs font-mono truncate max-w-[180px]">
                {expense.id}
              </dd>
            </div>
          </dl>
        </div>

        {/* Action buttons footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex gap-3">
          <Link
            href={`/expenses/${id}/edit`}
            className="flex-1 text-center bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            ✏️ Edit Expense
          </Link>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-lg hover:bg-red-100 transition font-medium text-sm"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
