import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { NavMenu } from "./nav-types";

/** Feature teaser card (Project Studio, Calculator) in menus and the mobile drawer. */
export function MenuPromo({ promo, className }: { promo: NavMenu["promo"]; className?: string }) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xs border border-border bg-surface-muted p-6 md:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2.5 text-label uppercase text-text-secondary">
          <span aria-hidden className="brand-mark" />
          {promo.eyebrow}
        </p>
        {promo.badge && <Badge variant="brand">{promo.badge}</Badge>}
      </div>
      <p className="mt-10 text-h3 text-text">{promo.title}</p>
      <p className="mt-3 text-small text-text-secondary">{promo.text}</p>
      <Link
        href={promo.href}
        className="mt-8 inline-flex items-center gap-2 text-small font-medium text-text after:absolute after:inset-0"
      >
        {promo.cta}
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-250 ease-out group-hover:translate-x-1"
          strokeWidth={1.75}
        />
      </Link>
    </div>
  );
}
