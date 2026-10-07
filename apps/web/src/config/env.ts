/**
 * Environment configuration for the web app.
 *
 * `NEXT_PUBLIC_*` values are inlined into the browser bundle at build time,
 * so they must never hold secrets. Everything else is server-only.
 */

const DEFAULT_DEV_API_URL = "http://localhost:8000";

/**
 * API base URL as seen from the browser. Optional: the public site does not
 * depend on the API (e.g. a frontend-only Vercel deploy). In development it
 * falls back to the local API; in production it must be set explicitly, and
 * API calls fail with a clear error when it is not.
 */
function publicApiUrl(): string | undefined {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return process.env.NODE_ENV === "production" ? undefined : DEFAULT_DEV_API_URL;
}

/** Public origin of the website: SITE_URL, else Vercel's production domain, else localhost. */
function siteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return vercelHost ? `https://${vercelHost}` : "http://localhost:3000";
}

export const env = {
  apiUrl: publicApiUrl(),
  /**
   * API base URL as seen from the Next.js server. Inside Docker the browser
   * URL (localhost) is not reachable from the web container, so the server
   * uses the internal service name instead. Undefined in the browser.
   */
  apiInternalUrl: process.env.API_INTERNAL_URL,
  /** Used for canonical and Open Graph URLs (server only). */
  siteUrl: siteUrl(),
} as const;
