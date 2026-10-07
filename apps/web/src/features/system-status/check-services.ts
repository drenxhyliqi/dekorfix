import { getDatabaseHealth, getHealth } from "@/lib/api";

export type CheckResult = { ok: true } | { ok: false; error: string };

export interface ServiceChecks {
  api: CheckResult;
  database: CheckResult;
}

async function run(check: () => Promise<unknown>): Promise<CheckResult> {
  try {
    await check();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function checkServices(): Promise<ServiceChecks> {
  const [api, database] = await Promise.all([
    run(getHealth),
    run(getDatabaseHealth),
  ]);
  return { api, database };
}
