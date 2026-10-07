import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Centers content at the page max-width (1440px) with responsive gutters. */
export function Container({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "article" | "aside";
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn("container-page", className)}>{children}</Tag>;
}
