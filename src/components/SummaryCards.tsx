"use client";

// ============================================================
// components/SummaryCards.tsx  (Updated — accepts real props)
//
// Renders 4 metric cards on the Dashboard:
//   1. Total Spent     — sum of all expenses this month
//   2. Monthly Budget  — budget set for this month
//   3. Remaining       — budget minus spent
//   4. Average per Day — total spent ÷ days elapsed this month
//
// Receives pre-computed values as props from the Server Component.
// Uses CurrencyContext to format all amounts.
// ============================================================

import { useCurrency } from "@/context/CurrencyContext";
import SummaryCard from "./SummaryCard";

interface SummaryCardsProps {
  totalSpent: number; // In cents
  totalBudget: number; // In cents
  remaining: number; // In cents (can be negative)
  month: string; // "YYYY-MM" — used to compute average per day
}

export default function SummaryCards({
  totalSpent,
  totalBudget,
  remaining,
  month,
}: SummaryCardsProps) {
  const { formatAmount } = useCurrency();

  // ---- Calculate Average Per Day ----
  // Figure out how many days have passed in the current month
  const today = new Date();
  const [year, monthNum] = month.split("-").map(Number);
  // .split("-") → ["2025", "01"]
  // .map(Number) → [2025, 1]

  // If we're looking at the current month → use today's day number
  // If it's a past month → use the last day of that month
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === monthNum;
  // getMonth() returns 0-11, so we add 1 to get 1-12

  const daysElapsed = isCurrentMonth
    ? today.getDate() // Day of month so far (e.g., 27)
    : new Date(year, monthNum, 0).getDate();
  // new Date(year, monthNum, 0) = last day of previous month = last day of our month

  const avgPerDay =
    daysElapsed > 0
      ? Math.round(totalSpent / daysElapsed) // Round to whole cents
      : 0;

  // ---- Determine trend for each card ----
  // "up" = bad (spending more), "down" = good (spending less)
  const spentTrend = totalSpent > totalBudget * 0.9 ? "up" : "neutral";
  const remainingTrend =
    remaining < 0 ? "up" : remaining < totalBudget * 0.2 ? "neutral" : "down";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Spent */}
      <SummaryCard
        label="Total Spent"
        value={formatAmount(totalSpent)}
        subLabel="This month"
        trend={spentTrend}
      />

      {/* Card 2: Monthly Budget */}
      <SummaryCard
        label="Monthly Budget"
        value={totalBudget > 0 ? formatAmount(totalBudget) : "Not set"}
        subLabel={totalBudget > 0 ? `For ${month}` : "Set a budget →"}
        trend="neutral"
      />

      {/* Card 3: Remaining */}
      <SummaryCard
        label="Remaining"
        value={formatAmount(Math.abs(remaining))}
        subLabel={remaining < 0 ? "⚠️ Over budget!" : "Left to spend"}
        trend={remainingTrend}
      />

      {/* Card 4: Average Per Day */}
      <SummaryCard
        label="Avg Per Day"
        value={formatAmount(avgPerDay)}
        subLabel={`Over ${daysElapsed} day${daysElapsed !== 1 ? "s" : ""}`}
        trend="neutral"
      />
    </div>
  );
}
