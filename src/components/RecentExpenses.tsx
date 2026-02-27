"use client";

// ============================================================
// components/RecentExpenses.tsx
//
// Shows the 5 most recent expenses as ExpenseCard components.
// Receives expenses as props from the Server Component.
//
// onEdit → navigates to the edit page
// onDelete → calls the deleteExpense thunk via Redux
// ============================================================

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { deleteExpense } from "@/store";
import { Expense } from "@/types/expense";
import ExpenseCard from "./ExpenseCard";
import Link from "next/link";

interface RecentExpensesProps {
  expenses: Expense[]; // Already sliced to last 5 by the server
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
  const router = useRouter(); // For navigation
  const dispatch = useAppDispatch(); // For Redux actions

  // Navigate to the edit page for this expense
  const handleEdit = (expense: Expense) => {
    router.push(`/expenses/${expense.id}/edit`);
  };

  // Delete: call the async thunk → hits DELETE /api/expenses/[id]
  const handleDelete = (id: string) => {
    dispatch(deleteExpense(id));
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center text-gray-400">
        <p className="text-lg">💸 No expenses yet</p>
        <Link
          href="/add"
          className="mt-3 inline-block text-blue-600 text-sm hover:underline"
        >
          + Add your first expense
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}

      {/* Link to see all expenses */}
      <div className="text-center mt-2">
        <Link
          href="/expenses"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          View all expenses →
        </Link>
      </div>
    </div>
  );
}
