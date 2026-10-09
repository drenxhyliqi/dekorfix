import type { Metadata } from "next";

import { geist } from "@/lib/fonts";

import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin · Dekorfix", template: "%s · Dekorfix Admin" },
  robots: { index: false, follow: false },
};

/**
 * Separate root layout for the admin area (not localized, no public chrome).
 * The panel's chrome lives in (panel)/layout.tsx; the sign-in page has none.
 * src/proxy.ts lets only signed-in admins past /admin/login.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    // Browser extensions may add attributes to <html> before hydration.
    <html lang="sq" className={geist.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
