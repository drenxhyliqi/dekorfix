import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE, userForToken } from "@/features/admin-auth/session";
import { defaultLocale, hasLocale } from "@/i18n/config";

/**
 * Admin pages need a valid session: checked with the API on every request,
 * so signing out or an expired session takes effect at once. The sign-in
 * page itself is open; a signed-in admin is sent on to the dashboard.
 */
async function guardAdmin(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const user = await userForToken(request.cookies.get(ADMIN_COOKIE)?.value);
  const onLogin = pathname === "/admin/login";
  if (user) return onLogin ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  if (onLogin) return NextResponse.next();

  const login = new URL("/admin/login", request.url);
  if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
  const response = NextResponse.redirect(login);
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  // Well-known URIs (e.g. Chrome DevTools' /.well-known/appspecific/…) are not
  // pages; answer directly instead of rendering the localized 404.
  if (first === ".well-known") return new NextResponse(null, { status: 404 });

  if (first === "admin") return guardAdmin(request);
  if (hasLocale(first)) return;

  // Locale-less public path, e.g. `/products` → `/sq/products`. Always Albanian,
  // whatever the browser's language: English only when the visitor switches to it.
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, route handlers under /api and any file with an extension
  // (icons, images, fonts), but still handle /.well-known/* (see above).
  matcher: ["/((?!_next|api/|.*\\..*).*)", "/.well-known/:path*"],
};
