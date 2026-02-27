// ============================================================
// hooks/useExpenseForm.ts
//
// What this hook does:
// Manages the form state for ADDING or EDITING an expense.
// It handles: field values, validation errors, submit, and reset.
//
// Usage for ADD form:
//   const form = useExpenseForm();
//
// Usage for EDIT form (pre-fills with existing data):
//   const form = useExpenseForm({ title: "Pizza", amount: 1500, ... });
//
// Then in your JSX:
//   <input value={form.values.title} onChange={form.handleChange} name="title" />
//   <button onClick={form.handleSubmit(onSave)}>Save</button>
// ============================================================

import { useState } from "react";
import { Expense, ExpenseCategory } from "@/types/expense";

// The fields the user fills in on the form
// We use Omit<Expense, "id" | "createdAt"> because those are server-generated
type ExpenseFormValues = Omit<Expense, "id" | "createdAt">;
// This equals: { title, amount, category, date, note? }

// The errors object — same keys as the form, all optional strings
type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>;
// Partial<...> means all fields are optional (no error = field is undefined)
// Record<K, V> means: object with keys of type K and values of type V

// What this hook returns to the component
interface UseExpenseFormReturn {
  values: ExpenseFormValues; // Current form field values
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void; // Call this on every input change
  errors: ExpenseFormErrors; // Validation error messages (empty = valid)
  handleSubmit: (onSuccess: (values: ExpenseFormValues) => void) => void; // Call this when form is submitted
  reset: () => void; // Call this to clear the form
  isValid: boolean; // true if there are no errors currently
}

// Default empty form values
const defaultValues: ExpenseFormValues = {
  title: "",
  amount: 0,
  category: "other", // Default category
  date: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD
  note: "",
};

// Allowed category values (for validation)
const ALLOWED_CATEGORIES: ExpenseCategory[] = [
  "food",
  "transport",
  "housing",
  "health",
  "entertainment",
  "education",
  "shopping",
  "other",
];

// ============================================================
// THE HOOK
// initialValues is optional — if not provided, uses defaults
// ============================================================
export function useExpenseForm(
  initialValues?: Partial<Expense>,
): UseExpenseFormReturn {
  // Build the starting values by merging defaults + any initialValues passed in
  const startingValues: ExpenseFormValues = {
    ...defaultValues,
    ...(initialValues
      ? {
          title: initialValues.title ?? defaultValues.title,
          amount: initialValues.amount ?? defaultValues.amount,
          category: initialValues.category ?? defaultValues.category,
          date: initialValues.date ?? defaultValues.date,
          note: initialValues.note ?? defaultValues.note,
        }
      : {}),
  };

  // ---- State: form field values ----
  const [values, setValues] = useState<ExpenseFormValues>(startingValues);

  // ---- State: validation errors ----
  const [errors, setErrors] = useState<ExpenseFormErrors>({});

  // ============================================================
  // handleChange — called every time the user types in a field
  //
  // e.target.name  = the "name" attribute of the input (e.g. "title")
  // e.target.value = what the user typed (always a string from input)
  // ============================================================
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Special handling for "amount": the input gives a string,
    // but we need to store it as a NUMBER (in cents).
    if (name === "amount") {
      // Parse the string to an integer (whole number only)
      const parsed = parseInt(value, 10); // 10 = base 10 (decimal)
      setValues((prev) => ({
        ...prev, // Keep all other fields
        amount: isNaN(parsed) ? 0 : parsed, // If not a valid number, use 0
      }));
    } else {
      // For all other fields, just store the string value directly
      setValues((prev) => ({
        ...prev,
        [name]: value,
        // [name] is "computed property" — uses the variable "name" as the key
        // e.g. if name = "title", this is: { ...prev, title: value }
      }));
    }

    // Clear the error for this field as the user starts typing
    // (so errors don't linger after the user fixes the issue)
    if (errors[name as keyof ExpenseFormValues]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined, // Remove the error for this field
      }));
    }
  };

  // ============================================================
  // validate — runs all validation rules
  // Returns an errors object (empty = all valid)
  // ============================================================
  const validate = (): ExpenseFormErrors => {
    const newErrors: ExpenseFormErrors = {};

    // Rule 1: title must not be empty
    if (!values.title.trim()) {
      newErrors.title = "Title is required";
    }

    // Rule 2: amount must be a positive integer (in cents)
    if (!Number.isInteger(values.amount) || values.amount <= 0) {
      newErrors.amount = "Amount must be a positive whole number (in cents)";
    }

    // Rule 3: category must be one of the allowed values
    if (!ALLOWED_CATEGORIES.includes(values.category)) {
      newErrors.category = "Please select a valid category";
    }

    // Rule 4: date must be in YYYY-MM-DD format and be a real date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!values.date || !dateRegex.test(values.date)) {
      newErrors.date = "Date must be in YYYY-MM-DD format";
    } else {
      const parsedDate = new Date(values.date);
      if (isNaN(parsedDate.getTime())) {
        newErrors.date = "Please enter a valid date";
      }
    }

    return newErrors;
  };

  // ============================================================
  // handleSubmit — call this when the user clicks the Save button
  //
  // It takes a callback function "onSuccess" which runs only if
  // all validations pass.
  //
  // Usage:  form.handleSubmit((values) => { dispatch(createExpense(values)) })
  // ============================================================
  const handleSubmit = (onSuccess: (values: ExpenseFormValues) => void) => {
    // Run all validation rules
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      // There are errors — show them and stop
      setErrors(validationErrors);
      return; // Don't call onSuccess
    }

    // All valid — clear errors and call onSuccess with the form values
    setErrors({});
    onSuccess(values);
  };

  // ============================================================
  // reset — clears the form back to initial/default state
  // ============================================================
  const reset = () => {
    setValues(startingValues);
    setErrors({});
  };

  // isValid — convenience property: true if there are currently no errors
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    handleChange,
    errors,
    handleSubmit,
    reset,
    isValid,
  };
}
