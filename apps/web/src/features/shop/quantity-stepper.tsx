"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { MAX_QUANTITY } from "./model";

/**
 * Number of packs: − / + buttons around a typed value. The field commits on
 * blur or Enter, so typing "12" does not pass through "1".
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  label,
  decreaseLabel,
  increaseLabel,
  size = "md",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  /** 0 lets the − button remove a cart line. */
  min?: 0 | 1;
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft === null) return;
    const typed = Number.parseInt(draft, 10);
    setDraft(null);
    if (Number.isFinite(typed)) onChange(Math.min(MAX_QUANTITY, Math.max(min, typed)));
  };
  const button = cn(
    "inline-flex shrink-0 items-center justify-center text-text-secondary transition-colors duration-150 hover:bg-surface-muted hover:text-text disabled:pointer-events-none disabled:opacity-30",
    size === "sm" ? "size-8" : "size-11",
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-sm border border-border-strong bg-surface", className)}
    >
      <button
        type="button"
        className={button}
        aria-label={decreaseLabel}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus aria-hidden className="size-3.5" strokeWidth={1.75} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={label}
        value={draft ?? String(value)}
        onChange={(event) => setDraft(event.target.value.replace(/\D/g, "").slice(0, 3))}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        className={cn(
          "h-full min-w-0 bg-transparent text-center tabular-nums text-text outline-none focus-visible:bg-surface-muted",
          size === "sm" ? "w-9 text-small" : "w-12 text-[0.9375rem]",
        )}
      />
      <button
        type="button"
        className={button}
        aria-label={increaseLabel}
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(Math.min(MAX_QUANTITY, value + 1))}
      >
        <Plus aria-hidden className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}
