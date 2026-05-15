
// new 

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

// ---------- next-intl middleware ----------
const intlMiddleware = createIntlMiddleware(routing);

// ---------- Route matchers (locale-aware) ----------
const isAuthRoute = createRouteMatcher([
  "/(en|am|om)?/sign-in(.*)",
  "/(en|am|om)?/sign-up(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/(en|am|om)?/admin(.*)",
]);

const isFarmerRoute = createRouteMatcher([
  "/(en|am|om)?/farmer(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/(en|am|om)?/admin(.*)",
  "/(en|am|om)?/farmer(.*)",
  "/(en|am|om)?/cart(.*)",
  "/(en|am|om)?/orders(.*)",
  "/(en|am|om)?/product(.*)",
  "/(en|am|om)?/user(.*)",
  "/(en|am|om)?/notifications(.*)",
]);

// ---------- Middleware ----------
export default clerkMiddleware(async (auth, req) => {
  // Run next-intl
  const intlResponse = intlMiddleware(req);

  // 🔴 CRITICAL FIX:
  // Only return if next-intl actually changed something
  if (intlResponse?.headers.get("location")) {
    return intlResponse;
  }

  const { userId, sessionClaims } = await auth();

  // Allow auth pages
  if (isAuthRoute(req)) {
    return NextResponse.next();
  }

  // Protected routes
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const role =
    (sessionClaims as { metadata?: { role?: "admin" | "farmer" | "buyer" }; public_metadata?: { role?: "admin" | "farmer" | "buyer" }; unsafe_metadata?: { role?: "admin" | "farmer" | "buyer" } })
      ?.metadata?.role ??
    (sessionClaims as { metadata?: { role?: "admin" | "farmer" | "buyer" }; public_metadata?: { role?: "admin" | "farmer" | "buyer" }; unsafe_metadata?: { role?: "admin" | "farmer" | "buyer" } })
      ?.public_metadata?.role ??
    (sessionClaims as { metadata?: { role?: "admin" | "farmer" | "buyer" }; public_metadata?: { role?: "admin" | "farmer" | "buyer" }; unsafe_metadata?: { role?: "admin" | "farmer" | "buyer" } })
      ?.unsafe_metadata?.role;

  if (isAdminRoute(req) && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isFarmerRoute(req) && role !== "farmer") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});


// ---------- Matcher ----------
export const config = {
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
  ],
};
