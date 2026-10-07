import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";

/** Picks `en` only when the browser prefers English over Albanian. */
function preferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (code && hasLocale(code)) return code;
  }
  return defaultLocale;
}

/**
 * Admin has no authentication yet, so it is only reachable in development,
 * or in a production build explicitly started with ADMIN_PREVIEW=true.
 * Replace with a session check when admin login is implemented.
 */
function adminAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ADMIN_PREVIEW === "true";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  // Well-known URIs (e.g. Chrome DevTools' /.well-known/appspecific/…) are not
  // pages; answer directly instead of rendering the localized 404.
  if (first === ".well-known") return new NextResponse(null, { status: 404 });

  if (first === "admin") {
    return adminAllowed() ? NextResponse.next() : new NextResponse("Not found", { status: 404 });
  }
  if (hasLocale(first)) return;

  // Locale-less public path, e.g. `/products` → `/sq/products`.
  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and any file with an extension (icons, images, fonts),
  // but still handle /.well-known/* (see above).
  matcher: ["/((?!_next|.*\\..*).*)", "/.well-known/:path*"],
};
