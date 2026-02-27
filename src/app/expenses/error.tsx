"use client"; // ← Must be a client component to use hooks

// ============================================================
// app/expenses/error.tsx  ← ERROR BOUNDARY
//
// Next.js automatically shows this file when expenses/page.tsx
// throws an error (like a failed fetch).
//
// "reset" is a function provided by Next.js — calling it
// re-renders the page and tries loading data again.
// ============================================================

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  // error.message = what went wrong
  // error.digest = unique server-side error ID (for debugging)
  reset: () => void;
  // Calling reset() re-tries loading the page (like a refresh)
}

export default function ErrorExpenses({ error, reset }: ErrorProps) {
  // Log the full error to the browser console for debugging
  useEffect(() => {
    console.error("[Expenses Error]", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
        {/* Error icon */}
        <div className="text-5xl mb-4">⚠️</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-red-700 mb-2">
          Oops! Something went wrong
        </h2>

        {/* Human-friendly message */}
        <p className="text-gray-600 mb-2">
          We couldn&apos;t load your expenses right now.
        </p>

        {/* Technical error detail (collapsed/small — for the developer) */}
        {error.message && (
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-6 font-mono">
            {error.message}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Retry button — calls Next.js reset() to re-render the page */}
          <button
            onClick={reset}
            className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition font-medium"
          >
            🔄 Try Again
          </button>

          {/* Go home — safe escape route */}
          <Link
            href="/"
            className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            🏠 Go to Dashboard
          </Link>
        </div>

        {/* Helpful tip */}
        <p className="text-xs text-gray-400 mt-6">
          If this keeps happening, make sure the dev server is running and check
          the terminal for errors.
        </p>
      </div>
    </div>
  );
}
