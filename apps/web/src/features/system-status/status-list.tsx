import { cn } from "@/lib/utils";

import type { ServiceChecks } from "./check-services";

export function StatusList({ checks }: { checks: ServiceChecks | null }) {
  const rows = [
    ["FastAPI", checks?.api],
    ["PostgreSQL", checks?.database],
  ] as const;

  return (
    <ul className="divide-y divide-border border-y border-border text-small">
      {rows.map(([label, result]) => (
        <li key={label} className="flex items-center justify-between gap-4 py-3">
          <span className="text-text">{label}</span>
          <span
            className={cn(
              "flex items-center gap-2",
              result === undefined ? "text-text-tertiary" : result.ok ? "text-text" : "text-danger",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                result === undefined ? "bg-border-strong" : result.ok ? "bg-text" : "bg-danger",
              )}
            />
            {result === undefined ? "checking…" : result.ok ? "ok" : `error (${result.error})`}
          </span>
        </li>
      ))}
    </ul>
  );
}
