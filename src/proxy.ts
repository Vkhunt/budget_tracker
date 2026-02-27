// ============================================================
// proxy.ts  ← NEXT.JS 16 PROXY (replaces middleware.ts)
//
// In Next.js 16+, this file is called "proxy" instead of "middleware".
// It runs BEFORE every matching page request — like a gatekeeper.
//
// This proxy:
//   1. Automatically sets a "user_session" cookie (for demo purposes)
//   2. Logs each matched request's path and timestamp
//   3. Checks the cookie and allows/blocks access
// ============================================================

import { NextRequest, NextResponse } from "next/server";

// ============================================================
// config: tells Next.js WHICH routes to apply this proxy to
// ============================================================
export const config = {
  matcher: [
    "/expenses/:path*", // Matches /expenses, /expenses/123, /expenses/123/edit
    "/add/:path*", // Matches /add and any sub-paths
    "/budget/:path*", // Matches /budget and any sub-paths
  ],
};

// ============================================================
// proxy function — runs for every matched request
// In Next.js 16, the export must be named "proxy" (not "middleware")
// ============================================================
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---- Log each matched request ----
  const timestamp = new Date().toISOString();
  console.log(`[Proxy] ${timestamp} | Path: ${pathname}`);

  // ---- Check for user_session cookie ----
  const userSession = request.cookies.get("user_session");

  // ---- AUTO-SET cookie for demo/development ----
  // In a real app, you'd check a real auth token here.
  // For this exam, we automatically set the cookie so navigation always works.
  // Remove this block and uncomment the redirect below to enforce login.
  if (!userSession) {
    // Auto-set the cookie and continue (don't block)
    const response = NextResponse.next();
    response.cookies.set("user_session", "demo-session", {
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    console.log(`[Proxy] Auto-set user_session cookie for: ${pathname}`);
    return response;
  }

  // Session cookie exists — allow the request
  console.log(`[Proxy] Session ✅ | Path: ${pathname}`);
  return NextResponse.next();

  // ---- OPTIONAL: To ENFORCE login, replace the auto-set block above with: ----
  // if (!userSession) {
  //   const redirectUrl = new URL("/?error=session_required", request.url);
  //   return NextResponse.redirect(redirectUrl);
  // }
}
