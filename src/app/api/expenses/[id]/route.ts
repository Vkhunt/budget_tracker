// ============================================================
// app/api/expenses/[id]/route.ts
// Handles requests for a SINGLE expense by its ID.
//
// URL examples:
//   GET    /api/expenses/abc-123   → get one expense
//   PUT    /api/expenses/abc-123   → update one expense
//   DELETE /api/expenses/abc-123   → delete one expense
//
// The [id] in the folder name is a "dynamic segment".
// Whatever is in the URL after /expenses/ becomes the "id".
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getExpenseById, updateExpense, deleteExpense } from "@/lib/data";

// In Next.js App Router, dynamic route params come as a Promise.
// We must "await" them to get the actual value.
interface RouteContext {
  params: Promise<{ id: string }>;
}

// ============================================================
// GET /api/expenses/[id]
// Returns a single expense matching the given id.
// Returns 404 if no expense with that id exists.
// ============================================================
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Step 1: Get the id from the URL
    const { id } = await context.params;

    // Step 2: Look it up in our data store
    const expense = getExpenseById(id);

    // Step 3: If not found, return 404 Not Found
    if (!expense) {
      return NextResponse.json(
        { success: false, message: `Expense with id "${id}" not found` },
        { status: 404 }, // 404 = Not Found
      );
    }

    // Step 4: Return the found expense
    return NextResponse.json({ success: true, data: expense }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch expense" },
      { status: 500 },
    );
  }
}

// ============================================================
// PUT /api/expenses/[id]
// Updates an existing expense with NEW data from the body.
//
// The body can have ANY of the expense fields (all optional):
//   { title?, amount?, category?, date?, note? }
//
// We MERGE the new fields with the existing expense.
// Fields not sent in the body remain unchanged.
// ============================================================
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Step 1: Get id from URL
    const { id } = await context.params;

    // Step 2: Check if the expense exists first
    const existingExpense = getExpenseById(id);

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, message: `Expense with id "${id}" not found` },
        { status: 404 },
      );
    }

    // Step 3: Read the partial update from the request body
    // "Partial<Expense>" means the body can have some or all Expense fields
    const body = await request.json();

    // ---- Optional Validations (only validate fields that were sent) ----

    const errors: string[] = [];

    // If title was sent, make sure it's not empty
    if (body.title !== undefined && body.title.trim() === "") {
      errors.push("Title cannot be empty");
    }

    // If amount was sent, make sure it's a positive whole number
    if (body.amount !== undefined) {
      if (!Number.isInteger(body.amount) || body.amount <= 0) {
        errors.push("Amount must be a positive whole number in cents");
      }
    }

    // If date was sent, validate the format
    if (body.date !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.date)) {
        errors.push("Date must be in YYYY-MM-DD format");
      }
    }

    // If any validation failed, return 400 with error list
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 },
      );
    }

    // Step 4: Merge the updates into the existing expense
    // updateExpense() in lib/data.ts does: { ...oldExpense, ...newFields }
    const updated = updateExpense(id, body);

    // Step 5: Return the updated expense
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update expense" },
      { status: 500 },
    );
  }
}

// ============================================================
// DELETE /api/expenses/[id]
// Permanently removes an expense from the data store.
// Returns a success message if deleted.
// Returns 404 if the expense doesn't exist.
// ============================================================
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Step 1: Get id from URL
    const { id } = await context.params;

    // Step 2: Try to delete it from our data store
    // deleteExpense() returns true if found & deleted, false if not found
    const wasDeleted = deleteExpense(id);

    // Step 3: If not found, return 404
    if (!wasDeleted) {
      return NextResponse.json(
        { success: false, message: `Expense with id "${id}" not found` },
        { status: 404 },
      );
    }

    // Step 4: Return success message
    return NextResponse.json(
      {
        success: true,
        message: "Expense deleted", // Exact message as required
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete expense" },
      { status: 500 },
    );
  }
}
