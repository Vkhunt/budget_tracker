"use client";

// ============================================================
// components/ExpenseCard.tsx
//
// A single expense item card — shows title, amount, category,
// date, note, and an action dropdown (Edit / Delete).
//
// The left border is color-coded by category.
//
// Usage:
//   <ExpenseCard
//     expense={expense}
//     onEdit={(expense) => router.push(`/expenses/${expense.id}/edit`)}
//     onDelete={(id) => dispatch(deleteExpense(id))}
//   />
// ============================================================

import { useState } from "react";
import { Expense } from "@/types/expense";
import { useCurrency } from "@/context/CurrencyContext";
import CategoryBadge, { CATEGORY_STYLES } from "./CategoryBadge";

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void; // Called when Edit is clicked
  onDelete: (id: string) => void; // Called when Delete is confirmed
  className?: string;
}

// Left border color per category
const BORDER_COLORS: Record<string, string> = {
  food: "border-l-orange-400",
  transport: "border-l-blue-400",
  housing: "border-l-purple-400",
  health: "border-l-green-400",
  entertainment: "border-l-pink-400",
  education: "border-l-indigo-400",
  shopping: "border-l-yellow-400",
  other: "border-l-gray-400",
};

export default function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  className = "",
}: ExpenseCardProps) {
  const { formatAmount } = useCurrency(); // For formatting amounts

  // ---- Dropdown menu state ----
  // isMenuOpen = true means the "⋮" dropdown is visible
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ---- Delete confirmation state ----
  const [showConfirm, setShowConfirm] = useState(false);

  // Get this category's left border color
  const borderColor = BORDER_COLORS[expense.category] ?? "border-l-gray-300";

  // Format the date nicely: "2025-01-15" → "Jan 15, 2025"
  const formattedDate = new Date(expense.date + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );

  return (
    <div
      className={`
        relative bg-white rounded-xl shadow-sm border border-gray-100
        border-l-4 ${borderColor}
        hover:shadow-md transition-shadow duration-200 p-4
        ${className}
      `}
    >
      {/* ---- Main content row ---- */}
      <div className="flex items-start justify-between gap-3">
        {/* LEFT: title, category badge, date */}
        <div className="flex-1 min-w-0">
          {/* Expense title */}
          <h3 className="font-semibold text-gray-800 truncate">
            {expense.title}
          </h3>

          {/* Category badge + date on same line */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <CategoryBadge category={expense.category} size="sm" />
            <span className="text-xs text-gray-400">📅 {formattedDate}</span>
          </div>

          {/* Optional note */}
          {expense.note && (
            <p className="text-xs text-gray-500 mt-1 italic truncate">
              {expense.note}
            </p>
          )}
        </div>

        {/* RIGHT: amount + action menu */}
        <div className="flex items-start gap-2 shrink-0">
          {/* Formatted amount — uses CurrencyContext */}
          <span className="text-lg font-bold text-gray-800">
            {formatAmount(expense.amount)}
          </span>

          {/* ⋮ three-dot menu button */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              // Toggle: if open → close, if closed → open
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              aria-label="Actions"
            >
              ⋮
            </button>

            {/* Dropdown menu (only rendered when isMenuOpen is true) */}
            {isMenuOpen && (
              <>
                {/* Invisible overlay to close menu when clicking outside */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />

                {/* Actual dropdown box */}
                <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[120px]">
                  {/* Edit option */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit(expense); // Pass the whole expense to parent
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    ✏️ Edit
                  </button>

                  {/* Delete option */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowConfirm(true); // Show confirmation first
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---- Delete Confirmation Bar ---- */}
      {/* Slides in at the bottom of the card when delete is clicked */}
      {showConfirm && (
        <div className="mt-3 pt-3 border-t border-red-100 flex items-center justify-between">
          <p className="text-sm text-red-600 font-medium">
            Delete this expense?
          </p>
          <div className="flex gap-2">
            {/* Cancel — go back to normal */}
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            {/* Confirm — actually delete */}
            <button
              onClick={() => {
                setShowConfirm(false);
                onDelete(expense.id); // Pass only the ID to parent
              }}
              className="text-xs px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
