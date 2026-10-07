import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/** Showcase block: a sticky label column and a content column. */
export function DsSection({
  id,
  title,
  description,
  tone,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  tone?: "muted" | "dark";
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-tone={tone === "dark" ? "dark" : undefined}
      className={cn("border-t border-border py-section-sm", tone === "muted" && "bg-surface-muted")}
    >
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-28">
            <h2 id={`${id}-title`} className="text-h4 text-text">
              {title}
            </h2>
            {description && <p className="mt-2 text-small text-text-secondary">{description}</p>}
          </div>
        </div>
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </Container>
    </section>
  );
}

export function DsLabel({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-label uppercase text-text-tertiary">{children}</p>;
}
