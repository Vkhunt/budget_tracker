"use client";

// ============================================================
// components/ExpensesListClient.tsx  ← INTERACTIVE EXPENSES LIST
//
// This is the CLIENT part of the Expenses page.
// The Server Component fetches data and passes it as props here.
// This component handles:
//   - Syncing server data into Redux store
//   - Showing ExpenseFiltersBar + filtered expense list
//   - Edit and Delete actions
// ============================================================

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setExpenses, deleteExpense } from "@/store";
import { useFilteredExpenses } from "@/hooks/useFilteredExpenses";
import { Expense } from "@/types/expense";
import ExpenseFiltersBar from "./ExpenseFiltersBar";
import ExpenseCard from "./ExpenseCard";
import Link from "next/link";

interface ExpensesListClientProps {
  initialExpenses: Expense[]; // Fetched on the server, passed as props
}

export default function ExpensesListClient({
  initialExpenses,
}: ExpensesListClientProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // ---- Sync server data → Redux store on first render ----
  // useEffect runs once after the component mounts in the browser.
  // We populate the Redux store with data fetched by the server.
  useEffect(() => {
    dispatch(setExpenses(initialExpenses));
    // setExpenses replaces all expenses in the store at once
  }, [dispatch, initialExpenses]);

  // ---- Read filtered + sorted expenses from Redux ----
  // useFilteredExpenses reads expenses + active filters from Redux
  // and applies all filters automatically.
  const { filteredExpenses, count } = useFilteredExpenses();

  // ---- Handlers ----
  const handleEdit = (expense: Expense) => {
    router.push(`/expenses/${expense.id}/edit`);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteExpense(id));
    // deleteExpense is the async thunk → calls DELETE /api/expenses/[id]
    // then removes from Redux store
  };

  return (
    <div>
      {/* ---- Filters Bar ---- */}
      <ExpenseFiltersBar className="mb-6" />

      {/* ---- Results count ---- */}
      <p className="text-sm text-gray-500 mb-4">
        Showing <span className="font-semibold text-gray-700">{count}</span>{" "}
        expense{count !== 1 ? "s" : ""}
      </p>

      {/* ---- Expense List or Empty State ---- */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          <p className="text-xl mb-2">🔍 No expenses found</p>
          <p className="text-sm">
            Try adjusting your filters or add a new expense.
          </p>
          <Link
            href="/add"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            + Add Expense
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
