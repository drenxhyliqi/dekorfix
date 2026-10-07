import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the production Docker image.
  // Vercel uses its own build output, so skip it there (VERCEL is set during Vercel builds).
  output: process.env.VERCEL ? undefined : "standalone",
  // Trace from the monorepo root so workspace packages are included in the bundle.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  cacheComponents: true,
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
