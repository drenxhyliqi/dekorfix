"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Numeric input in metres. Keeps the raw text while typing (so "2," or "2."
 * are allowed) and commits a number on every valid change; accepts both
 * decimal separators.
 */
export function MetreField({
  label,
  value,
  onCommit,
  step = 0.05,
  min = 0,
  className,
  compact,
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
  step?: number;
  min?: number;
  className?: string;
  compact?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? value.toFixed(2);

  const parse = (text: string) => Number.parseFloat(text.replace(",", "."));

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("text-text-secondary", compact ? "text-caption" : "text-small")}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          inputMode="decimal"
          value={shown}
          onChange={(event) => {
            setDraft(event.target.value);
            const parsed = parse(event.target.value);
            if (Number.isFinite(parsed) && parsed >= min) onCommit(parsed);
          }}
          onBlur={() => setDraft(null)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            event.preventDefault();
            const next = Math.max(min, Math.round((value + (event.key === "ArrowUp" ? step : -step)) * 100) / 100);
            setDraft(null);
            onCommit(next);
          }}
          className={cn(
            "w-full rounded-sm border border-border-strong bg-surface pr-9 tabular-nums text-text transition-[border-color,box-shadow] duration-150",
            "hover:border-text-tertiary focus-visible:border-text focus-visible:shadow-[inset_0_0_0_1px_var(--color-text)] focus-visible:outline-none",
            compact ? "h-9 pl-2.5 text-small" : "h-11 pl-3 text-body",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary",
            compact ? "text-caption" : "text-small",
          )}
        >
          m
        </span>
      </div>
    </div>
  );
}
