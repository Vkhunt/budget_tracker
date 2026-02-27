"use client";

// ============================================================
// components/CategoryBadge.tsx
//
// A small colored pill badge showing the expense category.
// Used inside ExpenseCard and the expense list.
//
// Usage:
//   <CategoryBadge category="food" />
//   <CategoryBadge category="transport" size="sm" />
// ============================================================

import { ExpenseCategory } from "@/types/expense";

interface CategoryBadgeProps {
  category: ExpenseCategory;
  size?: "sm" | "md"; // "sm" = smaller badge, "md" = default
  className?: string; // Extra CSS classes (optional)
}

// ---- Color + emoji map for each category ----
// Each category gets a unique background color and an emoji icon.
const CATEGORY_STYLES: Record<
  ExpenseCategory,
  { bg: string; text: string; emoji: string; label: string }
> = {
  food: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    emoji: "🍔",
    label: "Food",
  },
  transport: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    emoji: "🚌",
    label: "Transport",
  },
  housing: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    emoji: "🏠",
    label: "Housing",
  },
  health: {
    bg: "bg-green-100",
    text: "text-green-700",
    emoji: "💊",
    label: "Health",
  },
  entertainment: {
    bg: "bg-pink-100",
    text: "text-pink-700",
    emoji: "🎬",
    label: "Entertainment",
  },
  education: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    emoji: "📚",
    label: "Education",
  },
  shopping: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    emoji: "🛍️",
    label: "Shopping",
  },
  other: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    emoji: "📌",
    label: "Other",
  },
};

export default function CategoryBadge({
  category,
  size = "md", // Default size is "md"
  className = "",
}: CategoryBadgeProps) {
  // Look up the style for this category
  const style = CATEGORY_STYLES[category];

  // Size-based padding and font size
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-xs" // Smaller badge
      : "px-3 py-1 text-sm"; // Default badge

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${style.bg} ${style.text} ${sizeClasses} ${className}
      `}
    >
      {/* Category emoji */}
      <span>{style.emoji}</span>
      {/* Category label */}
      <span>{style.label}</span>
    </span>
  );
}

// Also export the styles map so other components can use the colors
export { CATEGORY_STYLES };
