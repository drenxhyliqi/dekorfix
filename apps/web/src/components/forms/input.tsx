"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { controlClasses, useFieldControl } from "./field";

export function Input({ className, ...props }: ComponentProps<"input">) {
  const { invalid: _invalid, ...control } = useFieldControl(props);
  return <input className={cn(controlClasses, "h-12 px-4", className)} {...control} />;
}
