"use client";

// ============================================================
// components/ExpenseForm.tsx  ← REUSABLE ADD/EDIT FORM
//
// Used by both:
//   /add              → adding a new expense
//   /expenses/[id]/edit → editing an existing expense
//
// Uses our custom useExpenseForm hook for state + validation.
// ============================================================

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useExpenseForm } from "@/hooks/useExpenseForm";
import { createExpense, editExpense } from "@/store";
import { Expense, ExpenseCategory } from "@/types/expense";
import { useCurrency } from "@/context/CurrencyContext";
import { useRouter } from "next/navigation";

// Props: pass initialValues to pre-fill (edit mode), or leave empty (add mode)
interface ExpenseFormProps {
  initialValues?: Partial<Expense>; // Optional — used in edit mode
  expenseId?: string; // Only needed in edit mode
}

// All 8 allowed categories for the dropdown
const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: "food", label: "🍔 Food" },
  { value: "transport", label: "🚌 Transport" },
  { value: "housing", label: "🏠 Housing" },
  { value: "health", label: "💊 Health" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "education", label: "📚 Education" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "other", label: "📌 Other" },
];

export default function ExpenseForm({
  initialValues,
  expenseId,
}: ExpenseFormProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { formatAmount } = useCurrency();

  // isEditMode = true if we have an expenseId (editing existing)
  const isEditMode = Boolean(expenseId);

  // ---- Convert cents → rupees for the form display ----
  // The database stores amounts in CENTS (e.g. 150000 = ₹1500.00)
  // But the user should type in RUPEES (e.g. 1500).
  // So when pre-filling an existing expense, we divide by 100.
  const formInitialValues = initialValues
    ? {
        ...initialValues,
        // If amount exists, convert from cents to rupees for the input
        amount: initialValues.amount ? initialValues.amount / 100 : 0,
      }
    : undefined;

  // Our custom hook manages all form state, validation, and helpers
  const { values, handleChange, errors, handleSubmit, reset } =
    useExpenseForm(formInitialValues);

  // ---- Handle form submission ----
  const onSubmit = () => {
    handleSubmit(async (formValues) => {
      // handleSubmit only calls this if ALL validations pass

      if (isEditMode && expenseId) {
        // ---- EDIT MODE ----
        // User typed in RUPEES (e.g. 1500) → multiply ×100 → store as cents (150000)
        await dispatch(
          editExpense({
            id: expenseId,
            updates: { ...formValues, amount: formValues.amount * 100 },
          }),
        );
        router.refresh();
        router.push(`/expenses/${expenseId}`);
      } else {
        // ---- ADD MODE ----
        // Same: user typed rupees → convert to cents before saving
        await dispatch(
          createExpense({ ...formValues, amount: formValues.amount * 100 }),
        );
        router.refresh();
        router.push("/expenses");
      }
    });
  };

  // ---- Amount preview: format what the user typed as currency ----
  // e.g. user types "1500" → shows "= ₹1,500.00"
  // We multiply by 100 because formatAmount expects cents
  const amountPreview =
    values.amount > 0 ? formatAmount(values.amount * 100) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="space-y-5">
        {/* ---- Title field ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title" // Must match the field name in useExpenseForm
            value={values.title}
            onChange={handleChange} // Our hook handles ALL inputs
            placeholder="e.g. Grocery Shopping"
            className={`
              w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
              ${
                errors.title
                  ? "border-red-400 focus:ring-red-200" // Red border if error
                  : "border-gray-200 focus:ring-blue-200"
              }
            `}
          />
          {/* Show error message below the input */}
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">⚠ {errors.title}</p>
          )}
        </div>

        {/* ---- Amount field ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount{" "}
            <span className="text-gray-400 text-xs font-normal">(₹ / $)</span>
            <span className="text-red-500"> *</span>
          </label>
          <input
            type="number"
            name="amount"
            value={values.amount === 0 ? "" : values.amount}
            onChange={handleChange}
            placeholder="e.g. 1500"
            min={0.01}
            step={0.01}
            className={`
              w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
              ${
                errors.amount
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:ring-blue-200"
              }
            `}
          />
          {/* Live currency preview */}
          {amountPreview && !errors.amount && (
            <p className="text-xs text-blue-600 mt-1">= {amountPreview}</p>
          )}
          {errors.amount && (
            <p className="text-xs text-red-500 mt-1">⚠ {errors.amount}</p>
          )}
        </div>

        {/* ---- Category dropdown ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={values.category}
            onChange={handleChange}
            className={`
              w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
              ${
                errors.category
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:ring-blue-200"
              }
            `}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-red-500 mt-1">⚠ {errors.category}</p>
          )}
        </div>

        {/* ---- Date field ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date" // Native date picker — gives YYYY-MM-DD format
            name="date"
            value={values.date}
            onChange={handleChange}
            className={`
              w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
              ${
                errors.date
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:ring-blue-200"
              }
            `}
          />
          {errors.date && (
            <p className="text-xs text-red-500 mt-1">⚠ {errors.date}</p>
          )}
        </div>

        {/* ---- Note field (optional) ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            name="note"
            value={values.note ?? ""}
            onChange={handleChange}
            placeholder="Any extra details..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
          />
        </div>

        {/* ---- Action Buttons ---- */}
        <div className="flex gap-3 pt-2">
          {/* Submit button */}
          <button
            onClick={onSubmit}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            {isEditMode ? "💾 Save Changes" : "➕ Add Expense"}
          </button>

          {/* Reset / Cancel button */}
          <button
            onClick={() => {
              reset(); // Clear form back to defaults
              router.back(); // Go to previous page
            }}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
