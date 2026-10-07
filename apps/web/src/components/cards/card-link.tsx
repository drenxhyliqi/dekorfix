import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Card title link whose hit area covers the whole card (the parent must be
 * `relative`). Keeps a single, well-labelled link per card for screen readers.
 */
export function CardLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none",
        "focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-focus",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Arrow that slides in on card hover. */
export function CardArrow({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="text-text transition-transform duration-250 ease-out group-hover:translate-x-1"
    >
      {children}
    </span>
  );
}
