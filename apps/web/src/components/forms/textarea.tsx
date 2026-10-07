"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { controlClasses, useFieldControl } from "./field";

export function Textarea({ className, rows = 5, ...props }: ComponentProps<"textarea">) {
  const { invalid: _invalid, ...control } = useFieldControl(props);
  return (
    <textarea rows={rows} className={cn(controlClasses, "min-h-28 resize-y px-4 py-3", className)} {...control} />
  );
}
