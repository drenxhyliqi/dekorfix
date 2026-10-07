import { Construction } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

/** Title row of an admin page. */
export function AdminPageHeader({
  title,
  description,
  meta,
}: {
  title: ReactNode;
  description?: string;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <h1 className="text-h3 text-text">{title}</h1>
        {description && <p className="text-small text-text-secondary">{description}</p>}
      </div>
      {meta}
    </header>
  );
}

/** White panel used for every admin content block. */
export function AdminPanel({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-sm border border-border bg-background p-6 ${className ?? ""}`}>
      {title && <h2 className="mb-4 text-label uppercase text-text-tertiary">{title}</h2>}
      {children}
    </section>
  );
}

/** Placeholder for a module that is built in the Admin Dashboard phase. */
export function AdminModulePlaceholder({ module }: { module: string }) {
  return (
    <AdminPanel>
      <div className="flex flex-col items-start gap-4 py-10 md:items-center md:text-center">
        <Construction aria-hidden className="size-6 text-text-tertiary" strokeWidth={1.25} />
        <Badge variant="outline">In development</Badge>
        <p className="max-w-md text-body text-text-secondary">
          {module} management will be implemented in the Admin Dashboard phase.
        </p>
      </div>
    </AdminPanel>
  );
}
