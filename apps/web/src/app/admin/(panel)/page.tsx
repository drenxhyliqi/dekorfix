import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

import { AdminPanel } from "@/components/admin/admin-page";
import { ADMIN_COOKIE, userForToken } from "@/features/admin-auth/session";
import { Dashboard, DashboardSkeleton } from "@/features/admin-dashboard/dashboard";
import { getDashboard, toPeriod } from "@/features/admin-dashboard/data";

import "@/features/admin-dashboard/dashboard.css";

export const metadata: Metadata = { title: { absolute: "Paneli · Dekorfix Admin" } };

/** The admin dashboard, for the period in `?days=` (7, 30 or 90; 30 by default). */
export default function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData searchParams={searchParams} />
    </Suspense>
  );
}

async function DashboardData({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const days = toPeriod((await searchParams).days);
  const [stats, user] = await Promise.all([
    getDashboard(days),
    userForToken((await cookies()).get(ADMIN_COOKIE)?.value),
  ]);
  if (!stats) {
    return (
      <AdminPanel>
        <p className="py-8 text-center text-body text-text-secondary">
          Të dhënat nuk u ngarkuan. Kontrolloni që API-ja të jetë në punë dhe rifreskoni faqen.
        </p>
      </AdminPanel>
    );
  }
  return <Dashboard stats={stats} name={user?.name ?? null} />;
}
