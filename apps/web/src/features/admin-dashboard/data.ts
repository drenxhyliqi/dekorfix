import type { DashboardStats } from "@dekorfix/shared";
import { cookies } from "next/headers";

import { ADMIN_COOKIE } from "@/features/admin-auth/session";
import { apiRequest } from "@/lib/api";

export const PERIODS = [7, 30, 90] as const;
export type Period = (typeof PERIODS)[number];

export function toPeriod(value: unknown): Period {
  const days = Number(value);
  return (PERIODS as readonly number[]).includes(days) ? (days as Period) : 30;
}

/** The dashboard's numbers, read with the admin's session. Null when the API cannot be reached. */
export async function getDashboard(days: Period): Promise<DashboardStats | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    return await apiRequest<DashboardStats>(`/api/v1/admin/dashboard?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Dashboard data could not be loaded", error);
    return null;
  }
}
