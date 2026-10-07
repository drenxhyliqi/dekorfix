"use client";

import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { controlClasses, useFieldControl } from "./field";

/** Native <select> (best accessibility and mobile UX) with Dekorfix styling. */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  const { invalid: _invalid, ...control } = useFieldControl(props);
  return (
    <div className="relative">
      <select className={cn(controlClasses, "h-12 appearance-none pl-4 pr-11", className)} {...control}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        strokeWidth={1.5}
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
      />
    </div>
  );
}
