import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ONLY_PREFIXES = ["/users", "/qa", "/settings", "/backup"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/devices",
  "/schedules",
  "/alerts",
  "/reports",
  "/ai",
  "/logs",
  "/profile",
  "/gardens",
  "/farms",
  ...ADMIN_ONLY_PREFIXES,
];

function isStaticPath(pathname: string) {
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) return true;
  if (pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml") return true;
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

function isProtectedPath(pathname: string) {
  if (pathname === "/") return true;
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  const isAuthed = request.cookies.get("nongtech_auth")?.value === "1";
  const role = request.cookies.get("nongtech_role")?.value;
  const status = request.cookies.get("nongtech_status")?.value;
  const assignedFarmCookie = request.cookies.get("nongtech_farms")?.value ?? "";
  const assignedFarmIds = assignedFarmCookie ? assignedFarmCookie.split("|").filter(Boolean) : [];
  const isInactive = status === "inactive";

  if (pathname === "/pending") {
    if (!isAuthed || isInactive) return NextResponse.next();
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/login") {
    if (isAuthed) {
      if (isInactive) {
        return NextResponse.redirect(new URL("/pending", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!isAuthed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isInactive) {
    return NextResponse.redirect(new URL("/pending", request.url));
  }

  const isAdminOnly = ADMIN_ONLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (isAdminOnly && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/farms", request.url));
  }

  const farmPathMatch = pathname.match(/^\/farms\/([^/]+)(?:\/|$)/);
  if (role === "FARMER" && farmPathMatch) {
    const requestedFarmId = farmPathMatch[1];
    if (assignedFarmIds.length > 0 && !assignedFarmIds.includes(requestedFarmId)) {
      return NextResponse.redirect(new URL("/farms", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
