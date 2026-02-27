"use client";

// ============================================================
// components/DashboardCharts.tsx  ← RECHARTS CHARTS (Client Component)
//
// WHY "use client"?
// Recharts needs to run in the browser (it uses canvas/SVG animations).
// So this MUST be a client component.
//
// The Server Component (page.tsx) fetches the data and passes it
// as "props" to this component.
//
// This component renders:
//   1. Pie/Donut chart — spending by category
//   2. Bar chart       — daily spending this month
// ============================================================

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Expense, ExpenseCategory } from "@/types/expense";
import { useCurrency } from "@/context/CurrencyContext";

// Props received from the Server Component
interface DashboardChartsProps {
  expenses: Expense[]; // All expenses for the current month
}

// ---- Colors for each category (used in Pie chart) ----
const CATEGORY_COLORS: Record<string, string> = {
  food: "#f97316", // orange
  transport: "#3b82f6", // blue
  housing: "#a855f7", // purple
  health: "#22c55e", // green
  entertainment: "#ec4899", // pink
  education: "#6366f1", // indigo
  shopping: "#eab308", // yellow
  other: "#6b7280", // gray
};

export default function DashboardCharts({ expenses }: DashboardChartsProps) {
  const { formatAmount } = useCurrency();

  // ============================================================
  // DATA PREPARATION for Pie Chart — spending by category
  // ============================================================
  // Group expenses by category and sum their amounts
  const categoryTotals: Record<string, number> = {};

  for (const expense of expenses) {
    const cat = expense.category;
    // If this category hasn't been seen, start at 0
    categoryTotals[cat] = (categoryTotals[cat] ?? 0) + expense.amount;
  }

  // Convert to Recharts format: [{ name: "food", value: 5000 }, ...]
  const pieData = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0) // Only show categories with spending
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // "food" → "Food"
      value,
    }));

  // ============================================================
  // DATA PREPARATION for Bar Chart — daily spending
  // ============================================================
  // Group expenses by day of month and sum amounts
  const dailyTotals: Record<string, number> = {};

  for (const expense of expenses) {
    const day = expense.date.slice(8, 10);
    // "2025-01-15".slice(8, 10) → "15" (the day number)
    dailyTotals[day] = (dailyTotals[day] ?? 0) + expense.amount;
  }

  // Sort by day number and convert to Recharts format
  const barData = Object.entries(dailyTotals)
    .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Sort ascending: 1, 2, 3...
    .map(([day, amount]) => ({
      day: `${parseInt(day)}`, // "01" → "1" (remove leading zero)
      amount,
    }));

  // If no data, show an empty state message
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
        <p className="text-lg">📊 No expenses this month</p>
        <p className="text-sm mt-1">Add some expenses to see charts!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ---- PIE / DONUT CHART ---- */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-4">
          🍩 Spending by Category
        </h3>

        {/* ResponsiveContainer makes the chart resize with the screen */}
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%" // Center X
              cy="50%" // Center Y
              innerRadius={70} // Non-zero innerRadius = donut
              outerRadius={110}
              paddingAngle={3} // Gap between slices
              dataKey="value" // Which field is the value
            >
              {/* Color each slice based on its category */}
              {pieData.map((entry, index) => {
                const catKey = entry.name.toLowerCase() as ExpenseCategory;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[catKey] ?? "#6b7280"}
                  />
                );
              })}
            </Pie>

            {/* Tooltip: shows formatted amount on hover */}
            <Tooltip
              formatter={(value: number | undefined) => [
                formatAmount(value ?? 0),
                "Amount",
              ]}
            />

            {/* Legend: color boxes below the chart */}
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ---- BAR CHART: Daily Spending ---- */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-4">📅 Daily Spending</h3>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={barData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            {/* Horizontal grid lines */}
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

            {/* X axis = day numbers */}
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              label={{ value: "Day", position: "insideBottom", offset: -2 }}
            />

            {/* Y axis = amount — use compact format so labels fit */}
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => {
                // Show compact: 150000 cents → ₹1.5k  (divide by 100 first, then abbreviate)
                const rupees = v / 100;
                if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}k`;
                return `₹${rupees.toFixed(0)}`;
              }}
              width={70}
            />

            {/* Tooltip on hover */}
            <Tooltip
              formatter={(v: number | undefined) => [
                formatAmount(v ?? 0),
                "Spent",
              ]}
            />

            {/* The actual bars */}
            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            {/* radius=[top-left, top-right, bottom-right, bottom-left] = rounded top */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
