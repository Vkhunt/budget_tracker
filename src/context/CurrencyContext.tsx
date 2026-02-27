"use client"; // ← Must be a client component because it uses useState and localStorage

// ============================================================
// context/CurrencyContext.tsx  ← CURRENCY & DISPLAY PREFERENCES
//
// What is Context API?
// React Context lets you share data across ALL components
// without passing it down manually through every parent → child.
//
// Without Context:  App → Page → Section → Card → Amount (pass all the way!)
// With Context:     Any component anywhere can just "use" the currency directly.
// ============================================================

import {
  createContext, // Creates a new context
  useContext, // Hook to READ from the context
  useState, // For storing the currency choice
  useEffect, // For saving to localStorage when currency changes
} from "react";

// ============================================================
// STEP 1: Define the TypeScript shape of the context value.
// Every component that uses this context will get these 4 things.
// ============================================================
interface CurrencyContextValue {
  currency: "USD" | "EUR" | "GBP" | "INR";
  // Only these 4 currencies are allowed (union type)

  setCurrency: (c: CurrencyContextValue["currency"]) => void;
  // A function to change the currency
  // (c) => void means: takes a currency string, returns nothing

  formatAmount: (cents: number) => string;
  // A function that takes an amount in CENTS and returns a formatted string
  // e.g. formatAmount(150000) → "₹1,500.00"

  locale: string;
  // The locale string used for formatting (e.g. "en-IN" for India)
}

// ============================================================
// STEP 2: Create the context with createContext()
// The argument is the DEFAULT value (used if no Provider wraps the component)
// We use "undefined" as a placeholder — we enforce it's always wrapped below.
// ============================================================
const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

// ============================================================
// STEP 3: Map each currency to its locale string
// The locale controls how numbers are formatted:
//   "en-US" → 1,500.00
//   "en-IN" → 1,500.00 with ₹ symbol
// ============================================================
const CURRENCY_LOCALES: Record<CurrencyContextValue["currency"], string> = {
  USD: "en-US", // US Dollar   → $
  EUR: "de-DE", // Euro        → €
  GBP: "en-GB", // British Pound → £
  INR: "en-IN", // Indian Rupee  → ₹
};

// ============================================================
// STEP 4: Create the PROVIDER component
// This wraps the app and "provides" the context value to all children.
// ============================================================
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Initialize currency from localStorage (if saved) or default to "INR"
  const [currency, setCurrencyState] = useState<
    CurrencyContextValue["currency"]
  >(() => {
    // This function runs ONCE when the component first loads
    // We check localStorage for a previously saved currency choice.
    //
    // typeof window !== "undefined" checks we're in the BROWSER
    // (Next.js runs code on the server too, where localStorage doesn't exist)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferred-currency");
      // Validate that the saved value is one of our allowed currencies
      if (saved && ["USD", "EUR", "GBP", "INR"].includes(saved)) {
        return saved as CurrencyContextValue["currency"];
      }
    }
    return "INR"; // Default currency = Indian Rupee
  });

  // Get the locale for the current currency
  const locale = CURRENCY_LOCALES[currency];

  // ---- Save to localStorage whenever currency changes ----
  useEffect(() => {
    // useEffect runs AFTER the component renders
    // The [currency] at the end means: only run when "currency" changes
    localStorage.setItem("preferred-currency", currency);
  }, [currency]); // ← Dependency array: re-run ONLY when "currency" changes

  // ---- Handle currency change ----
  const setCurrency = (newCurrency: CurrencyContextValue["currency"]) => {
    setCurrencyState(newCurrency); // Update React state → triggers re-render
    // useEffect above will save to localStorage automatically
  };

  // ---- formatAmount function ----
  // Converts CENTS to a nicely formatted currency string.
  //
  // Example: formatAmount(150000)
  //   cents → 150000
  //   step 1: divide by 100 → 1500.00
  //   step 2: format → "₹1,500.00" (if currency is INR)
  //
  // Intl.NumberFormat is a built-in JavaScript API for formatting numbers.
  // It automatically:
  //   - Adds the correct currency symbol (₹, $, €, £)
  //   - Adds commas or periods in the right places per locale
  //   - Shows exactly 2 decimal places
  const formatAmount = (cents: number): string => {
    const amount = cents / 100; // Convert cents to full currency units

    return new Intl.NumberFormat(locale, {
      style: "currency", // Format as currency (adds symbol)
      currency: currency, // Which currency (INR, USD, etc.)
      minimumFractionDigits: 2, // Always show 2 decimal places
      maximumFractionDigits: 2, // Never show more than 2
    }).format(amount);

    // Examples:
    //   INR: "₹1,500.00"
    //   USD: "$15.00"
    //   EUR: "15,00 €"
    //   GBP: "£15.00"
  };

  // ============================================================
  // STEP 5: Return the Provider with the value
  // Any component inside <CurrencyProvider> can now access
  // { currency, setCurrency, formatAmount, locale }
  // ============================================================
  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, formatAmount, locale }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

// ============================================================
// STEP 6: Create a custom hook for easy usage
//
// Instead of writing this in every component:
//   const ctx = useContext(CurrencyContext);
//   if (!ctx) throw new Error("...");
//
// Components can simply write:
//   const { formatAmount, currency } = useCurrency();
// ============================================================
export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);

  // If someone uses useCurrency() outside of <CurrencyProvider>,
  // this will throw a helpful error message instead of crashing silently.
  if (context === undefined) {
    throw new Error(
      "useCurrency() must be used inside a <CurrencyProvider>. " +
        "Make sure CurrencyProvider wraps your app in layout.tsx.",
    );
  }

  return context;
}
