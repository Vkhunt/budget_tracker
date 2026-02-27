"use client"; // ← Needs client for usePathname and currency state

// ============================================================
// components/Navbar.tsx  ← TOP NAVIGATION BAR (Updated)
//
// Shows on every page (added in layout.tsx).
// Contains:
//   - App logo/name (left)
//   - Nav links: Dashboard, Expenses, Add Expense, Budget (center)
//   - Currency switcher dropdown (right)
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";

// Nav links array — easy to add/remove links
const NAV_LINKS = [
  { href: "/", label: "📊 Dashboard" },
  { href: "/expenses", label: "💰 Expenses" },
  { href: "/add", label: "➕ Add Expense" },
  { href: "/budget", label: "🎯 Budget" },
];

// Supported currencies for the switcher
const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
] as const;

export default function Navbar() {
  const pathname = usePathname(); // Current URL path (e.g. "/expenses")

  // Get currency state + setter from CurrencyContext
  const { currency, setCurrency } = useCurrency();

  // Controls whether the currency dropdown is open
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  // Look up the current currency's symbol for the button label
  const currentCurrency = CURRENCIES.find((c) => c.code === currency);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* sticky top-0 = stays at top when you scroll */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* ---- LEFT: Brand / Logo ---- */}
        <Link
          href="/"
          className="text-xl font-bold text-blue-600 shrink-0 flex items-center gap-1"
        >
          💸 ExpenseTracker
        </Link>

        {/* ---- CENTER: Navigation Links ---- */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {NAV_LINKS.map((link) => {
            // Highlight the link that matches the current page
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition
                  ${
                    isActive
                      ? "bg-blue-100 text-blue-700" // Active: blue highlight
                      : "text-gray-600 hover:bg-gray-100" // Inactive: gray hover
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ---- RIGHT: Currency Switcher Dropdown ---- */}
        <div className="relative shrink-0">
          {/* Button shows current currency symbol + code */}
          <button
            onClick={() => setIsCurrencyOpen((prev) => !prev)}
            className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <span>{currentCurrency?.symbol}</span>
            <span>{currency}</span>
            {/* ▼ arrow — flips when open */}
            <span
              className={`transition-transform ${isCurrencyOpen ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>

          {/* Dropdown panel (only shown when isCurrencyOpen is true) */}
          {isCurrencyOpen && (
            <>
              {/* Invisible overlay — clicking outside closes the dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsCurrencyOpen(false)}
              />

              {/* Dropdown box */}
              <div className="absolute right-0 top-11 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px]">
                <p className="text-xs text-gray-400 px-3 py-1 font-medium uppercase tracking-wide">
                  Currency
                </p>

                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code); // Save to localStorage via CurrencyContext
                      setIsCurrencyOpen(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition
                      ${
                        currency === c.code
                          ? "bg-blue-50 text-blue-700 font-semibold" // Active currency
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <span className="text-base">{c.symbol}</span>
                    <div>
                      <span className="font-medium">{c.code}</span>
                      <span className="text-xs text-gray-400 ml-1">
                        {c.name}
                      </span>
                    </div>
                    {/* Checkmark for active currency */}
                    {currency === c.code && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
