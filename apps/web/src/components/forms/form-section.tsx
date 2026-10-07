import type { ReactNode } from "react";

import { Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/**
 * Groups related fields: title and description on the left, fields on the
 * right (stacked on mobile). Fields use a 2-column grid from `sm`; give a
 * child `sm:col-span-2` to span the full width.
 */
export function FormSection({
  title,
  description,
  className,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("grid gap-8 border-t border-border pt-8 lg:grid-cols-12 lg:gap-x-8", className)}>
      <div className="space-y-2 lg:col-span-4">
        <Heading as="h3" size="h4">
          {title}
        </Heading>
        {description && <Text size="small">{description}</Text>}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">{children}</div>
    </section>
  );
}
