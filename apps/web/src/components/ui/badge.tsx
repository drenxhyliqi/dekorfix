import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "neutral" | "outline" | "brand" | "inverse";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-surface-strong text-text-secondary",
  outline: "border border-border-strong text-text-secondary",
  brand: "bg-brand-soft text-brand-text",
  inverse: "bg-inverse text-inverse-text",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-xs px-2 text-[0.6875rem] font-medium uppercase leading-none tracking-[0.08em]",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
