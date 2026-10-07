import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-page";
import { adminNavigation } from "@/config/admin-navigation";
import { ClientStatus, ServerStatus, StatusList } from "@/features/system-status";

export const metadata: Metadata = { title: { absolute: "Dashboard · Dekorfix Admin" } };

export default function AdminDashboardPage() {
  const modules = adminNavigation.flatMap((group) => group.sections).filter((s) => s.key !== "dashboard");

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Content and request management are built in the Admin Dashboard phase."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminPanel title="Modules" className="lg:col-span-2">
          <ul className="grid gap-px overflow-hidden rounded-xs border border-border bg-border sm:grid-cols-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <li key={module.key} className="bg-background">
                  <Link
                    href={module.href}
                    className="group flex h-full items-start gap-4 p-5 transition-colors hover:bg-surface-muted"
                  >
                    <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-text" strokeWidth={1.5} />
                    <span className="flex-1">
                      <span className="flex items-center justify-between text-[0.9375rem] font-medium text-text">
                        {module.label}
                        <ArrowRight
                          aria-hidden
                          className="size-4 text-text-tertiary transition-transform group-hover:translate-x-0.5"
                          strokeWidth={1.5}
                        />
                      </span>
                      <span className="mt-1 block text-small text-text-secondary">{module.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel title="System status · server">
            <Suspense fallback={<StatusList checks={null} />}>
              <ServerStatus />
            </Suspense>
          </AdminPanel>
          <AdminPanel title="System status · browser">
            <ClientStatus />
          </AdminPanel>
          <AdminPanel title="Developer">
            <Link href="/en/design-system" className="group inline-flex items-center gap-2 text-small font-medium text-text">
              Design system reference
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
            </Link>
          </AdminPanel>
        </div>
      </div>
    </>
  );
}
