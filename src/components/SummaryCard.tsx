"use client";

// ============================================================
// components/SummaryCard.tsx
//
// A single metric card for the Dashboard.
// Shows a label, a formatted value, and an optional trend arrow.
//
// Usage:
//   <SummaryCard label="Total Spent" value="₹1,500.00" trend="up" />
//   <SummaryCard label="Remaining" value="₹3,500.00" trend="down" />
// ============================================================

interface SummaryCardProps {
  label: string; // Card title (e.g. "Total Spent")
  value: string; // The main number to display (already formatted)
  subLabel?: string; // Optional small text below the value
  trend?: "up" | "down" | "neutral"; // Arrow direction
  className?: string;
}

export default function SummaryCard({
  label,
  value,
  subLabel,
  trend,
  className = "",
}: SummaryCardProps) {
  // ---- Trend arrow + color ----
  // "up"   = spending went UP   = bad (red)  ↑
  // "down" = spending went DOWN = good (green) ↓
  // "neutral" = no change = gray →
  const trendConfig = {
    up: { arrow: "↑", color: "text-red-500", label: "Increased" },
    down: { arrow: "↓", color: "text-green-500", label: "Decreased" },
    neutral: { arrow: "→", color: "text-gray-400", label: "No change" },
  };

  const trendInfo = trend ? trendConfig[trend] : null;

  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-5
        hover:shadow-md transition-shadow duration-200
        ${className}
      `}
    >
      {/* Card label (e.g. "Total Spent") */}
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>

      {/* Main value row: big number + trend arrow */}
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>

        {/* Trend arrow (only shown if "trend" prop was passed) */}
        {trendInfo && (
          <span
            className={`text-xl font-bold ${trendInfo.color}`}
            title={trendInfo.label} // Tooltip on hover
          >
            {trendInfo.arrow}
          </span>
        )}
      </div>

      {/* Optional sub-label below the value */}
      {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
    </div>
  );
}
