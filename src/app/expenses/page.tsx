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

import Link from "next/link";
import { Expense } from "@/types/expense";
import ExpensesListClient from "@/components/ExpensesListClient";

// ============================================================
// fetchAllExpenses — server-side data fetch
//
// We use fetch() pointing to our own API route.
// { cache: 'no-store' } = never cache — always get fresh data.
// This is needed because expenses change often.
// ============================================================
async function fetchAllExpenses(): Promise<Expense[]> {
  try {
    // Build the full URL for our API.
    // process.env.NEXT_PUBLIC_BASE_URL = set in .env (e.g. "https://myapp.com")
    // In development, falls back to "http://localhost:3000"
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/expenses`, {
      cache: "no-store",
      // "no-store" = don't cache this response.
      // Every page load fetches fresh data from the API.
    });

    if (!response.ok) {
      // .ok is false for 4xx/5xx errors
      throw new Error(`API error: ${response.status}`);
    }

    const json = await response.json();
    return json.data as Expense[]; // The array of expenses
  } catch (error) {
    // If fetch fails, throw so the error.tsx boundary catches it
    throw new Error("Failed to load expenses from server");
  }
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
