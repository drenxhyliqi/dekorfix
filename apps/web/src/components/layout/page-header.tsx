import type { ReactNode } from "react";

import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";

/** Compact header for inner pages (no media). */
export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  breadcrumbs,
  breadcrumbsLabel,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  breadcrumbsLabel?: string;
}) {
  return (
    <header className="border-b border-border">
      <div className="container-page pb-12 pt-10 md:pb-16 md:pt-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} label={breadcrumbsLabel} className="mb-10 md:mb-14" />}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-8">
            {eyebrow && <Eyebrow className="mb-6">{eyebrow}</Eyebrow>}
            <Heading as="h1" size="h1">
              {title}
            </Heading>
          </div>
          {(description || actions) && (
            <div className="flex flex-col items-start gap-6 lg:col-span-4">
              {description && <Text size="lead">{description}</Text>}
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
