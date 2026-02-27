// ============================================================
// app/page.tsx  ← DASHBOARD (SERVER COMPONENT)
//
// This is a SERVER COMPONENT — it runs on the server, not
// in the browser. That means:
//   ✅ It can fetch data directly (no useEffect needed)
//   ✅ Faster first load (HTML is pre-rendered)
//   ❌ Cannot use useState, useEffect, or browser APIs
//
// Data flow:
//   Server fetches expenses + budget
//       ↓ passes as props
//   Client Components render the interactive UI
// ============================================================

// ⭐ THIS IS THE KEY FIX:
// By default, Next.js caches Server Component results (for speed).
// That means new expenses won't show up until the cache expires!
// 'force-dynamic' tells Next.js: "NEVER cache this page —
// always fetch fresh data from the server on every visit."
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import {
  fetchExpensesForMonth,
  fetchBudgetForMonth,
  getCurrentMonth,
} from "@/lib/serverApi";
import SummaryCards from "@/components/SummaryCards";
import DashboardCharts from "@/components/DashboardCharts";
import BudgetProgressBar from "@/components/BudgetProgressBar";
import RecentExpenses from "@/components/RecentExpenses";

// ---- Skeleton loading fallback (shown while Suspense waits) ----
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-7 w-32 bg-gray-300 rounded" />
    </div>
  );
}

// ============================================================
// The actual page component
// "async" keyword lets us use "await" inside this component.
// Server Components support async/await natively!
// ============================================================
export default async function DashboardPage() {
  // ---- Step 1: Get the current month (e.g. "2025-01") ----
  const currentMonth = getCurrentMonth();

  // ---- Step 2: Fetch expenses and budget IN PARALLEL ----
  // Promise.all([...]) runs both fetches at the same time
  // instead of waiting for one to finish before starting the other.
  const [expenses, budget] = await Promise.all([
    fetchExpensesForMonth(currentMonth),
    fetchBudgetForMonth(currentMonth),
  ]);

  // ---- Step 3: Calculate summary numbers ----
  // totalSpent = sum of all expense amounts (in cents)
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  // .reduce() starts at 0 and adds each expense's amount

  const totalBudget = budget.amount;
  const remaining = totalBudget - totalSpent;

  // ---- Step 4: Get 5 most recent expenses for the "Recent" section ----
  // expenses are already sorted newest-first from fetchExpensesForMonth
  const recentExpenses = expenses.slice(0, 5);
  // .slice(0, 5) returns the first 5 items

  // ============================================================
  // RENDER
  // We use <Suspense> around each section so that if a part
  // takes time to load, the rest of the page still shows.
  // ============================================================
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ---- Page Header ---- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview for{" "}
          <span className="font-medium text-gray-700">
            {/* Format "2025-01" → "January 2025" */}
            {new Date(`${currentMonth}-01`).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </p>
      </div>

      {/* ---- Section 1: 4 Summary Cards ---- */}
      <section className="mb-8">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          }
        >
          {/*
            SummaryCards is a Client Component.
            We pass the computed values as props.
            CurrencyContext inside will format them.
          */}
          <SummaryCards
            totalSpent={totalSpent}
            totalBudget={totalBudget}
            remaining={remaining}
            month={currentMonth}
          />
        </Suspense>
      </section>

      {/* ---- Section 2: Budget Progress Bar ---- */}
      {totalBudget > 0 && (
        <section className="mb-8">
          <BudgetProgressBar
            spent={totalSpent}
            budget={totalBudget}
            month={currentMonth}
          />
        </section>
      )}

      {/* ---- Section 3: Charts ---- */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Spending Overview
        </h2>
        <Suspense
          fallback={
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 animate-pulse">
              Loading charts...
            </div>
          }
        >
          {/*
            DashboardCharts is a Client Component (Recharts needs browser).
            We pass the expenses data as a prop.
          */}
          <DashboardCharts expenses={expenses} />
        </Suspense>
      </section>

      {/* ---- Section 4: Recent Expenses (last 5) ---- */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            🕐 Recent Expenses
          </h2>
          <Link
            href="/expenses"
            className="text-sm text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          }
        >
          {/* RecentExpenses handles edit and delete actions */}
          <RecentExpenses expenses={recentExpenses} />
        </Suspense>
      </section>
    </div>
  );
}
