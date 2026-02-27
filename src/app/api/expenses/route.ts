// ============================================================
// app/api/expenses/route.ts  ← GET all expenses + POST new expense
//
// URL: /api/expenses
//
// GET  → Returns all expenses (with optional filters)
// POST → Creates a new expense (with validation)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAllExpenses, addExpense } from "@/lib/data";
import { Expense, ExpenseCategory } from "@/types/expense";

// ============================================================
// GET /api/expenses
//
// Returns all expenses, filtered and sorted.
//
// Optional query params you can add to the URL:
//   ?category=food         → only show food expenses
//   ?month=2025-01         → only show expenses in January 2025
//   ?search=netflix        → only show expenses with "netflix" in title
//
// Example URL:
//   /api/expenses?category=food&month=2025-01
// ============================================================
export async function GET(request: NextRequest) {
  try {
    // Step 1: Read query parameters from the URL
    // new URL(request.url) parses the full URL
    // searchParams lets us read the ?key=value parts
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category"); // e.g. "food" or null
    const month = searchParams.get("month"); // e.g. "2025-01" or null
    const search = searchParams.get("search"); // e.g. "netflix" or null

    // Step 2: Get all expenses from our in-memory store
    let results = getAllExpenses();
    // "let" because we will change "results" using filters below

    // Step 3: Apply CATEGORY filter (if the user passed ?category=...)
    if (category && category !== "all") {
      results = results.filter(
        (expense) => expense.category === category,
        // Keep only expenses whose category matches
      );
    }

    // Step 4: Apply MONTH filter (if the user passed ?month=...)
    if (month) {
      results = results.filter(
        (expense) => expense.date.startsWith(month),
        // "2025-01-15".startsWith("2025-01") → true ✅
        // "2024-12-01".startsWith("2025-01") → false ❌
      );
    }

    // Step 5: Apply SEARCH filter (if the user passed ?search=...)
    if (search) {
      // Convert both to lowercase for case-insensitive search
      // "Netflix".toLowerCase() → "netflix"
      const searchLower = search.toLowerCase();
      results = results.filter(
        (expense) => expense.title.toLowerCase().includes(searchLower),
        // .includes() returns true if the string contains the search word
      );
    }

    // Step 6: Sort by date DESCENDING (newest first)
    results.sort((a, b) => {
      // .sort() compares two items at a time
      // If result is negative → a comes first
      // If result is positive → b comes first
      return new Date(b.date).getTime() - new Date(a.date).getTime();
      // Newer date has a LARGER timestamp, so subtracting gives negative → comes first
    });

    // Step 7: Return the filtered and sorted list
    return NextResponse.json(
      {
        success: true,
        count: results.length, // How many expenses are returned
        data: results,
      },
      { status: 200 }, // 200 = OK
    );
  } catch (error) {
    // If anything goes wrong, return a 500 error
    return NextResponse.json(
      { success: false, message: "Failed to fetch expenses" },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/expenses
//
// Creates a new expense.
// The client sends a JSON body with:
//   { title, amount, category, date, note? }
//
// The server adds: id (unique) and createdAt (timestamp)
// Returns the full created expense with status 201.
// ============================================================
export async function POST(request: NextRequest) {
  try {
    // Step 1: Read the JSON body sent by the client
    const body = await request.json();
    // "await" waits for the async operation to finish
    // After this, body = { title: "Pizza", amount: 1500, ... }

    // Step 2: Pull out each field from the body
    const { title, amount, category, date, note } = body;

    // ============================================================
    // VALIDATION - Check that the data is correct before saving
    // ============================================================

    // Collect all errors in an array first
    const errors: string[] = [];

    // Check 1: title must not be empty
    if (!title || title.trim() === "") {
      // .trim() removes extra spaces — " " becomes ""
      errors.push("Title is required and cannot be empty");
    }

    // Check 2: amount must be a positive integer (in cents)
    if (
      amount === undefined || // Not provided at all
      amount === null ||
      !Number.isInteger(amount) || // Must be a whole number (no decimals)
      amount <= 0 // Must be greater than 0
    ) {
      errors.push(
        "Amount must be a positive whole number in cents (e.g. 1500 = ₹15.00)",
      );
    }

    // Check 3: category must be one of the allowed values
    const allowedCategories: ExpenseCategory[] = [
      "food",
      "transport",
      "housing",
      "health",
      "entertainment",
      "education",
      "shopping",
      "other",
    ];
    if (!category || !allowedCategories.includes(category)) {
      errors.push(`Category must be one of: ${allowedCategories.join(", ")}`);
    }

    // Check 4: date must be a valid YYYY-MM-DD string
    // A simple regex test: \d = digit, {4} = exactly 4 digits, etc.
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!date || !dateRegex.test(date)) {
      errors.push("Date must be in YYYY-MM-DD format (e.g. 2025-01-15)");
    } else {
      // Also check that it's a real date (not something like 2025-99-99)
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        errors.push("Date is not a valid calendar date");
      }
    }

    // If ANY errors were found, return 400 (Bad Request)
    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors, // Send back all error messages
        },
        { status: 400 }, // 400 = Bad Request
      );
    }

    // ============================================================
    // Step 3: Create the new expense object
    // ============================================================
    const newExpense: Expense = {
      id: crypto.randomUUID(), // Generates a unique ID like "abc123-..."
      title: title.trim(), // Remove extra spaces from title
      amount, // In cents — already validated
      category,
      date,
      note: note?.trim() || undefined,
      // note?.trim() → if note exists, trim it. The "?" means "only if note is not null"
      createdAt: new Date().toISOString(),
      // new Date() = current date & time
      // .toISOString() = converts to "2025-01-15T10:30:00.000Z" format
    };

    // Step 4: Save it to our in-memory store
    const saved = addExpense(newExpense);

    // Step 5: Return the created expense with status 201 (Created)
    return NextResponse.json(
      {
        success: true,
        message: "Expense created successfully",
        data: saved,
      },
      { status: 201 }, // 201 = Created (not 200, because something NEW was made)
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create expense" },
      { status: 500 },
    );
  }
}
