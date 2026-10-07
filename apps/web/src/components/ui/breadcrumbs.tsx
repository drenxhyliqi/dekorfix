import Link from "next/link";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current page. */
  href?: string;
}

export function Breadcrumbs({
  items,
  label = "Breadcrumb",
  className,
}: {
  items: BreadcrumbItem[];
  /** Accessible name of the landmark (localise it). */
  label?: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-text-tertiary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors duration-150 hover:text-text"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={cn(isLast && "text-text-secondary")}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden className="text-border-strong">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
