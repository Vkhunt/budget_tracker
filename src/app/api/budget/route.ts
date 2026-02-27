// ============================================================
// app/api/budget/route.ts
// Handles the monthly budget.
//
// GET  /api/budget?month=2025-01  → get budget for that month
// POST /api/budget                → set or update a monthly budget
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getBudgetByMonth, setBudget } from "@/lib/data";
import { MonthlyBudget } from "@/types/expense";

// ============================================================
// GET /api/budget
// Returns the budget for a specific month.
//
// Query param: ?month=YYYY-MM  (e.g. ?month=2025-01)
// If no month is given, it defaults to the CURRENT month.
//
// Returns the budget amount in cents, or amount=0 if not set.
// ============================================================
export async function GET(request: NextRequest) {
  try {
    // Step 1: Read the ?month= query param from the URL
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    // Step 2: If no month was provided, default to current month
    // new Date() = today's date
    // .toISOString() = "2025-01-27T..."
    // .slice(0, 7) = "2025-01" (just YYYY-MM part)
    const targetMonth = month ?? new Date().toISOString().slice(0, 7);

    // Step 3: Look up the budget in our data store
    const budget = getBudgetByMonth(targetMonth);

    // Step 4: If no budget is set for that month, return 0
    if (!budget) {
      return NextResponse.json(
        {
          success: true,
          data: {
            month: targetMonth,
            amount: 0, // 0 means no budget has been set yet
          } as MonthlyBudget,
        },
        { status: 200 },
      );
    }

    // Step 5: Return the found budget
    return NextResponse.json({ success: true, data: budget }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch budget" },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/budget
// Sets or updates the budget for a specific month.
//
// Request body: { month: "YYYY-MM", amount: number }
// - month: The month to set the budget for
// - amount: Budget in CENTS (e.g. 500000 = ₹5000.00)
// ============================================================
export async function POST(request: NextRequest) {
  try {
    // Step 1: Read the JSON body
    const body = await request.json();
    const { month, amount } = body;

    // ---- Validation ----
    const errors: string[] = [];

    // Check: month must be in YYYY-MM format
    const monthRegex = /^\d{4}-\d{2}$/;
    // \d = any digit, {4} = exactly 4, - = dash, {2} = exactly 2
    if (!month || !monthRegex.test(month)) {
      errors.push("month must be in YYYY-MM format (e.g. 2025-01)");
    }

    // Check: amount must be a non-negative integer (0 is allowed = remove budget)
    if (amount === undefined || !Number.isInteger(amount) || amount < 0) {
      errors.push("amount must be a non-negative whole number in cents");
    }

    // Return errors if any
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 },
      );
    }

    // Step 2: Save/update the budget in our store
    // setBudget() will update if already exists, or add if new month
    const saved = setBudget({ month, amount } as MonthlyBudget);

    // Step 3: Return the saved budget
    return NextResponse.json(
      {
        success: true,
        message: amount === 0 ? "Budget cleared" : "Budget saved successfully",
        data: saved,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to save budget" },
      { status: 500 },
    );
  }
}
