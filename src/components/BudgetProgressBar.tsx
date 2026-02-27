"use client";

// ============================================================
// components/BudgetProgressBar.tsx
//
// A labeled progress bar showing how much of the budget is used.
// Color changes based on % spent:
//   < 70%  → green  ✅ (safe)
//   70–90% → yellow ⚠️ (warning)
//   > 90%  → red    ❌ (danger)
//
// Usage:
//   <BudgetProgressBar spent={150000} budget={500000} month="2025-01" />
// ============================================================

import { useCurrency } from "@/context/CurrencyContext";

interface BudgetProgressBarProps {
  spent: number; // Amount spent, in cents
  budget: number; // Total budget, in cents
  month: string; // e.g. "2025-01" (shown as a label)
  className?: string;
}

export default function BudgetProgressBar({
  spent,
  budget,
  month,
  className = "",
}: BudgetProgressBarProps) {
  // Get the formatAmount function from CurrencyContext
  const { formatAmount } = useCurrency();

  // ---- Calculate the percentage ----
  // If budget is 0, show 0% (avoid dividing by zero!)
  const percentage =
    budget > 0
      ? Math.min((spent / budget) * 100, 100)
      : // Math.min(..., 100) caps the bar at 100% even if over budget
        0;

  // Round to 1 decimal place for display
  const displayPercent = percentage.toFixed(1);

  // ---- Choose bar color based on percentage ----
  let barColor: string;
  let statusText: string;

  if (percentage < 70) {
    barColor = "bg-green-500"; // Safe
    statusText = "On track";
  } else if (percentage < 90) {
    barColor = "bg-yellow-400"; // Warning
    statusText = "Getting close";
  } else {
    barColor = "bg-red-500"; // Danger / Over budget
    statusText = spent > budget ? "Over budget!" : "Almost at limit";
  }

  // Format the month for display: "2025-01" → "January 2025"
  const formattedMonth = new Date(`${month}-01`).toLocaleDateString("en-US", {
    month: "long", // Full month name
    year: "numeric",
  });

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}
    >
      {/* Header row: month name + status text */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="font-semibold text-gray-800">{formattedMonth}</p>
          <p className="text-xs text-gray-400">Budget Progress</p>
        </div>
        {/* Status badge */}
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            percentage < 70
              ? "bg-green-100 text-green-700"
              : percentage < 90
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {statusText}
        </span>
      </div>

      {/* Progress bar track (gray background) */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        {/* Colored fill — width is set to the percentage */}
        <div
          className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
          // We use inline style for the dynamic width
          // Tailwind can't compute dynamic values like w-[73%] at build time
        />
      </div>

      {/* Amounts row: spent / budget + percentage */}
      <div className="flex justify-between items-center mt-2 text-sm">
        <div className="text-gray-600">
          {/* formatAmount converts cents → formatted currency string */}
          <span className="font-medium text-gray-800">
            {formatAmount(spent)}
          </span>
          <span className="text-gray-400"> / {formatAmount(budget)}</span>
        </div>
        <span className="font-semibold text-gray-700">{displayPercent}%</span>
      </div>
    </div>
  );
}
