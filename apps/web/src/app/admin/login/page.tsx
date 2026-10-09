import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "@/components/brand/logo";
import { LoginForm, LoginFormFromUrl } from "@/features/admin-auth/login-form";

import "./login.css";

export const metadata: Metadata = { title: "Hyrja" };

/** Admin sign-in: one centred form, the logo above and a way back to the site. */
export default function AdminLoginPage() {
  return (
    <div className="lg-page">
      <header className="lg-top">
        <Link href="/" aria-label="Faqja e Dekorfix" className="rounded-xs">
          <Logo className="w-28" />
        </Link>
        <Link href="/" className="lg-back group/back">
          <ArrowLeft
            aria-hidden
            className="size-4 transition-transform duration-200 group-hover/back:-translate-x-0.5"
            strokeWidth={1.75}
          />
          <span className="hidden sm:inline">Kthehu te faqja</span>
          <span className="sm:hidden">Faqja</span>
        </Link>
      </header>

      <main className="lg-main">
        <div className="lg-panel">
          <p className="text-label uppercase text-text-tertiary">Administrimi</p>
          <h1 className="mt-3 text-[2.5rem] font-semibold leading-none tracking-[-0.045em] text-text">Hyni</h1>
          <p className="mt-3 text-body text-text-secondary">Përdorni llogarinë tuaj të administrimit.</p>

          <div className="mt-10">
            <Suspense fallback={<LoginForm next={null} />}>
              <LoginFormFromUrl />
            </Suspense>
          </div>
        </div>
      </main>

      <footer className="lg-foot">Vetëm për stafin e Dekorfix · Dekorfix sh.p.k.</footer>
    </div>
  );
}
