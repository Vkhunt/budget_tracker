// ============================================================
// app/expenses/page.tsx  ← EXPENSES LIST PAGE (SERVER COMPONENT)
//
// Fetches all expenses from the API using fetch() with
// { cache: 'no-store' } — this means Next.js will ALWAYS
// fetch fresh data instead of showing a cached version.
//
// Then passes the data as props to ExpensesListClient
// (a Client Component) for interactivity.
// ============================================================

// ⭐ KEY: Prevent Next.js from pre-rendering this page at BUILD time.
// Without this, Vercel tries to fetch /api/expenses during the build,
// but the API doesn't exist yet during build → crash!
// 'force-dynamic' = render this page on every REQUEST, not at build time.
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Expense } from "@/types/expense";
import { getAllExpenses } from "@/lib/data";
import ExpensesListClient from "@/components/ExpensesListClient";

// ============================================================
// fetchAllExpenses — server-side data fetch
//
// On Vercel, Server Components should read directly from the
// data source (lib/data.ts) instead of using fetch() to call
// their own API routes to avoid proxy blocks and timeouts.
// ============================================================
async function fetchAllExpenses(): Promise<Expense[]> {
  // Read directly from our in-memory "database"
  const allExpenses = getAllExpenses();

  // Sort descending by date (newest first)
  allExpenses.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return allExpenses;
}

// ============================================================
// THE PAGE COMPONENT
// "async" because we await the fetch above.
// ============================================================
export default async function ExpensesPage() {
  // Fetch fresh expenses on every request
  const expenses = await fetchAllExpenses();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ---- Header row ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">💰 My Expenses</h1>
          <p className="text-gray-500 mt-1">
            {expenses.length} total expense{expenses.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Add button */}
        <Link
          href="/add"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm self-start sm:self-auto"
        >
          ➕ Add Expense
        </Link>
      </div>

      {/*
        ExpensesListClient is a Client Component.
        We pass the server-fetched expenses as "initialExpenses" prop.
        The client component loads them into Redux for filtering/editing.
      */}
      <ExpensesListClient initialExpenses={expenses} />
    </div>
  );
}
