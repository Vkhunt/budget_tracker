// ============================================================
// app/expenses/loading.tsx  ← SHIMMER SKELETON LOADING
//
// Next.js automatically shows this file while expenses/page.tsx
// is loading its data. It replaces the real page content
// with placeholder "skeleton" shapes that animate.
//
// The "shimmer" effect works by animating a gradient from
// left to right over the gray boxes using Tailwind's
// "animate-pulse" class (simple fade in/out).
// ============================================================

// A single skeleton card row — mimics the shape of an ExpenseCard
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        {/* LEFT side: title + badge + date placeholders */}
        <div className="flex-1 space-y-2">
          {/* Title placeholder — wide gray bar */}
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />

          {/* Badge + date row */}
          <div className="flex gap-2">
            {/* Category badge placeholder */}
            <div className="h-5 bg-gray-100 rounded-full w-20 animate-pulse" />
            {/* Date placeholder */}
            <div className="h-5 bg-gray-100 rounded w-24 animate-pulse" />
          </div>

          {/* Note placeholder (only on some cards) */}
          <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
        </div>

        {/* RIGHT side: amount placeholder + menu button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-6 w-6 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// A skeleton for the filters bar at the top
function SkeletonFiltersBar() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-3">
        {/* 3 filter input placeholders */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 min-w-[140px] space-y-1">
            <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
            <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoadingExpenses() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ---- Skeleton Header ---- */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          {/* Page title placeholder */}
          <div className="h-8 bg-gray-200 rounded w-44 animate-pulse" />
          {/* Subtitle placeholder */}
          <div className="h-4 bg-gray-100 rounded w-28 animate-pulse" />
        </div>
        {/* "Add" button placeholder */}
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* ---- Skeleton Filters Bar ---- */}
      <SkeletonFiltersBar />

      {/* ---- Skeleton Result count ---- */}
      <div className="h-4 bg-gray-100 rounded w-36 mb-4 animate-pulse" />

      {/* ---- 5 Skeleton Expense Card Rows ---- */}
      <div className="space-y-3">
        {/* Array.from creates an array of 5 items so we can map over it */}
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}
