/*
 * The admin session cookie. Shared by the proxy (which checks it on every
 * admin request) and the sign-in / sign-out actions. Pure, no server-only
 * imports, so the proxy can use it.
 */

import { env } from "@/config/env";

export const ADMIN_COOKIE = "dfx_admin_session";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
}

/** Where to go after signing in: only paths inside the admin area. */
export function safeNext(next: unknown): string {
  // "/admin", or "/admin/…" / "/admin?…": never another host or the sign-in page itself.
  if (typeof next !== "string" || !/^\/admin(?:[/?][^\s\\]*)?$/.test(next)) return "/admin";
  return next.startsWith("/admin/login") ? "/admin" : next;
}

/** The signed-in user for a session token, or null (expired, signed out, or the API is unreachable). */
export async function userForToken(token: string | undefined): Promise<AdminUser | null> {
  const base = env.apiInternalUrl ?? env.apiUrl;
  if (!token || !base) return null;
  try {
    const response = await fetch(`${base}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    return response.ok ? ((await response.json()) as AdminUser) : null;
  } catch {
    return null;
  }
}
