"use client";

// ============================================================
// components/ExpenseFiltersBar.tsx
//
// A toolbar with all filter controls:
//   - Search text input
//   - Category dropdown
//   - Month picker
//   - Min / Max amount inputs
//   - Active filter count + Reset button
//
// Every change immediately dispatches to Redux store.
// useFilteredExpenses hook then picks up the new filters automatically.
// ============================================================

import { useCurrency } from "@/context/CurrencyContext";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setFilters, clearFilters } from "@/store";
import { ExpenseCategory } from "@/types/expense";

interface ExpenseFiltersBarProps {
  className?: string;
}

// All allowed categories for the dropdown
const CATEGORIES: { value: ExpenseCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "food", label: "🍔 Food" },
  { value: "transport", label: "🚌 Transport" },
  { value: "housing", label: "🏠 Housing" },
  { value: "health", label: "💊 Health" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "education", label: "📚 Education" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "other", label: "📌 Other" },
];

export default function ExpenseFiltersBar({
  className = "",
}: ExpenseFiltersBarProps) {
  const dispatch = useAppDispatch(); // For sending actions to Redux

  // Read current filter values from Redux store
  const filters = useAppSelector((state) => state.expenses.filters);

  // ---- Count how many filters are active ----
  // We count each filter that differs from "no filter" state
  const activeFilterCount = [
    filters.category !== "all", // Category filter on?
    filters.month !== "", // Month filter on?
    filters.search.trim() !== "", // Search filter on?
    filters.minAmount !== null, // Min amount filter on?
    filters.maxAmount !== null, // Max amount filter on?
  ].filter(Boolean).length; // .filter(Boolean) removes "false" values, then count

  // ---- Handler: dispatch filter update to Redux ----
  // We dispatch setFilters with only the changed field.
  // Redux merges it with the rest of the filters.
  const handleFilterChange = (
    key: string,
    value: string | number | null | ExpenseCategory | "all",
  ) => {
    dispatch(setFilters({ [key]: value }));
    // [key] = computed property — uses the variable as the key
    // e.g. key = "search" → dispatches: { search: value }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 ${className}`}
    >
      {/* ---- Row 1: Search + Category + Month ---- */}
      <div className="flex flex-wrap gap-3">
        {/* Search input */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            🔍 Search
          </label>
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            // onChange fires on every keystroke → immediately filters the list
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Category dropdown */}
        <div className="min-w-[160px]">
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            📂 Category
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              handleFilterChange(
                "category",
                e.target.value as ExpenseCategory | "all",
              )
            }
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {/* Render all category options */}
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Month picker */}
        <div className="min-w-[160px]">
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            📅 Month
          </label>
          <input
            type="month"
            // type="month" gives a built-in month picker, value is "YYYY-MM"
            value={filters.month}
            onChange={(e) => handleFilterChange("month", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* ---- Row 2: Min amount + Max amount + Active filter count + Reset ---- */}
      <div className="flex flex-wrap gap-3 mt-3 items-end">
        {/* Min amount */}
        <div className="min-w-[130px]">
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            Min Amount (cents)
          </label>
          <input
            type="number"
            placeholder="e.g. 1000"
            min={0}
            value={filters.minAmount ?? ""}
            // ?? "" shows empty string when null (so input isn't "null")
            onChange={(e) => {
              const val = e.target.value;
              // If empty, set to null (no filter). If not, parse to integer.
              handleFilterChange(
                "minAmount",
                val === "" ? null : parseInt(val, 10),
              );
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Max amount */}
        <div className="min-w-[130px]">
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            Max Amount (cents)
          </label>
          <input
            type="number"
            placeholder="e.g. 50000"
            min={0}
            value={filters.maxAmount ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              handleFilterChange(
                "maxAmount",
                val === "" ? null : parseInt(val, 10),
              );
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Active filter count + Reset button (only shown when filters are active) */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            {/* Badge showing how many filters are on */}
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
              active
              {/* Plural: "1 filter" vs "2 filters" */}
            </span>

            {/* Reset button — clears ALL filters back to default */}
            <button
              onClick={() => dispatch(clearFilters())}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition"
            >
              ✕ Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
