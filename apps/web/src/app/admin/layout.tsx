import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { geist } from "@/lib/fonts";

import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin · Dekorfix", template: "%s · Dekorfix Admin" },
  robots: { index: false, follow: false },
};

/**
 * Separate root layout for the admin area (not localized, no public chrome).
 * Access control arrives with authentication; until then src/proxy.ts keeps
 * /admin out of production builds unless ADMIN_PREVIEW=true.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={geist.variable} data-scroll-behavior="smooth">
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
