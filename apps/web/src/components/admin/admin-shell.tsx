"use client";

import { ArrowUpRight, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/dialog";
import { adminNavigation, findAdminSection } from "@/config/admin-navigation";
import { adminRoutes } from "@/config/routes";
import { cn } from "@/lib/utils";

/**
 * Admin chrome: dark sidebar (drawer below `lg`), top bar, content area.
 * Pathname-dependent parts (active link, breadcrumb) sit in their own
 * Suspense boundaries so pages with request-time params still prerender.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-surface-muted lg:pl-64">
      <aside data-tone="dark" className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      <Drawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        label="Admin navigation"
        side="left"
        width="sm"
        className="lg:hidden"
      >
        <div data-tone="dark" className="min-h-full">
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </div>
      </Drawer>

      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open admin navigation"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          className="-ml-2 inline-flex size-10 items-center justify-center rounded-sm text-text hover:bg-surface-muted lg:hidden"
        >
          <Menu aria-hidden className="size-5" strokeWidth={1.5} />
        </button>
        <Suspense fallback={<Breadcrumb pathname={null} />}>
          <CurrentBreadcrumb />
        </Suspense>
        <div className="hidden sm:block">
          <Badge variant="outline">Development access</Badge>
        </div>
      </header>

      <main id="main" className="px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

function CurrentBreadcrumb() {
  return <Breadcrumb pathname={usePathname()} />;
}

function Breadcrumb({ pathname }: { pathname: string | null }) {
  const section = pathname ? findAdminSection(pathname) : undefined;
  const isDetail = section && pathname ? pathname !== section.href : false;
  return (
    <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
      <ol className="flex items-center gap-2 truncate text-small text-text-tertiary">
        <li>
          <Link href={adminRoutes.dashboard} className="hover:text-text">
            Admin
          </Link>
        </li>
        {section && section.key !== "dashboard" && (
          <>
            <li aria-hidden>/</li>
            <li>
              {isDetail ? (
                <Link href={section.href} className="hover:text-text">
                  {section.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-text">
                  {section.label}
                </span>
              )}
            </li>
          </>
        )}
        {isDetail && (
          <>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-text">
              Edit
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <Link
          href={adminRoutes.dashboard}
          onClick={onNavigate}
          aria-label="Dekorfix admin dashboard"
          className="rounded-xs"
        >
          <Logo tone="inverse" className="w-24" />
        </Link>
        <span className="text-label uppercase text-text-tertiary">Admin</span>
      </div>

      <Suspense fallback={<SidebarNav pathname={null} onNavigate={onNavigate} />}>
        <CurrentSidebarNav onNavigate={onNavigate} />
      </Suspense>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex h-9 items-center justify-between rounded-sm px-3 text-small text-text-secondary transition-colors hover:bg-surface-muted hover:text-text"
        >
          View website
          <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}

function CurrentSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return <SidebarNav pathname={usePathname()} onNavigate={onNavigate} />;
}

function SidebarNav({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  const active = pathname ? findAdminSection(pathname)?.key : undefined;
  return (
    <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto px-3 py-6">
      {adminNavigation.map((group) => (
        <div key={group.group} className="mb-6">
          <p className="mb-2 px-3 text-caption uppercase tracking-[0.08em] text-text-tertiary">{group.group}</p>
          <ul className="space-y-0.5">
            {group.sections.map((section) => {
              const isActive = section.key === active;
              const Icon = section.icon;
              return (
                <li key={section.key}>
                  <Link
                    href={section.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex h-9 items-center gap-3 rounded-sm px-3 text-small transition-colors duration-150",
                      isActive
                        ? "bg-surface-strong text-text"
                        : "text-text-secondary hover:bg-surface-muted hover:text-text",
                    )}
                  >
                    {isActive && <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 bg-brand" />}
                    <Icon aria-hidden className="size-4" strokeWidth={1.5} />
                    {section.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
