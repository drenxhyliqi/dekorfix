/**
 * Environment configuration for the web app.
 *
 * `NEXT_PUBLIC_*` values are inlined into the browser bundle at build time,
 * so they must never hold secrets. Everything else is server-only.
 */

const DEFAULT_DEV_API_URL = "http://localhost:8000";

function resolvePublicApiUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_URL must be set for production builds.");
  }
  return DEFAULT_DEV_API_URL;
}

export const env = {
  /** API base URL as seen from the browser. */
  apiUrl: resolvePublicApiUrl(),
  /**
   * API base URL as seen from the Next.js server. Inside Docker the browser
   * URL (localhost) is not reachable from the web container, so the server
   * uses the internal service name instead. Undefined in the browser.
   */
  apiInternalUrl: process.env.API_INTERNAL_URL,
  /** Public origin of the website, used for canonical and Open Graph URLs (server only). */
  siteUrl: process.env.SITE_URL ?? "http://localhost:3000",
} as const;
