import type { Metadata } from "next";
import Link from "next/link";

import { geist } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "404 · Dekorfix",
};

/** For URLs outside any locale. Localized 404s live in app/[lang]/not-found.tsx. */
export default function GlobalNotFound() {
  return (
    <html lang="sq" className={geist.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-dvh items-center">
        <main className="container-page">
          <p className="text-label uppercase text-text-tertiary">404</p>
          <h1 className="mt-6 text-h1 text-text">Faqja nuk u gjet.</h1>
          <p className="mt-3 text-lead text-text-secondary" lang="en">
            Page not found.
          </p>
          <p className="mt-10 flex gap-6 text-small font-medium">
            <Link href="/sq" className="underline underline-offset-4">
              Ballina
            </Link>
            <Link href="/en" lang="en" className="underline underline-offset-4">
              Home
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
