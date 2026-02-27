// ============================================================
// app/layout.tsx  ← ROOT LAYOUT
//
// This file wraps EVERY page in the app.
// We add providers here so they are available everywhere:
//   1. ReduxProvider  → makes Redux store available
//   2. CurrencyProvider → makes currency formatting available
// ============================================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/context/ReduxProvider"; // Redux store
import { CurrencyProvider } from "@/context/CurrencyContext"; // Currency formatting
import Navbar from "@/components/Navbar";

// Load the "Inter" font from Google Fonts
const inter = Inter({ subsets: ["latin"] });

// Page metadata — shows in browser tab title and Google search results
export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your expenses and manage your monthly budget",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 
          Provider nesting order (outermost first):
          ReduxProvider → CurrencyProvider → app content

          This means:
          - CurrencyContext can access Redux if needed in future
          - All pages can use BOTH Redux AND currency context
        */}
        <ReduxProvider>
          <CurrencyProvider>
            {/* Navbar is always shown on every page */}
            <Navbar />

            {/* Main page content area */}
            <main className="min-h-screen bg-gray-50">{children}</main>
          </CurrencyProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
