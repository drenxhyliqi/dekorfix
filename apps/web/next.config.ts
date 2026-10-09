import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the production Docker image.
  // Vercel uses its own build output, so skip it there (VERCEL is set during Vercel builds).
  output: process.env.VERCEL ? undefined : "standalone",
  // Trace from the monorepo root so workspace packages are included in the bundle.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  cacheComponents: true,
  // Pages that were replaced: Solutions by the product finder, points of sale by export,
  // the quote request by the contact form; sign-in is the admin's.
  async redirects() {
    return [
      { source: "/:lang(sq|en)/solutions", destination: "/:lang/product-finder", permanent: true },
      { source: "/:lang(sq|en)/solutions/:slug", destination: "/:lang/product-finder", permanent: true },
      { source: "/:lang(sq|en)/where-to-buy", destination: "/:lang/export", permanent: true },
      { source: "/:lang(sq|en)/request-quote", destination: "/:lang/contact", permanent: true },
      { source: "/:lang(sq|en)/login", destination: "/admin/login", permanent: false },
    ];
  },
  // Uploaded product images live in the API (/media); serve them from the site's own origin.
  async rewrites() {
    const api = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    return [{ source: "/media/:path*", destination: `${api}/media/:path*` }];
  },
  partialPrefetching: true,
  experimental: {
    // app/global-not-found.tsx: 404 for URLs outside a locale (the root layout is app/[lang]).
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
