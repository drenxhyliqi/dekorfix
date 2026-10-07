import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./container";
import { Eyebrow, Heading, Text } from "./typography";

export type SectionTone = "default" | "muted" | "dark";

const tones: Record<SectionTone, string> = {
  default: "",
  muted: "bg-surface-muted",
  dark: "",
};

const spacings = {
  default: "py-section",
  compact: "py-section-sm",
  none: "",
} as const;

export interface SectionProps {
  id?: string;
  tone?: SectionTone;
  spacing?: keyof typeof spacings;
  /** Wrap children in the page container (default true). */
  contained?: boolean;
  className?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
}

export function Section({
  tone = "default",
  spacing = "default",
  contained = true,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-tone={tone === "dark" ? "dark" : undefined}
      className={cn(tones[tone], spacings[spacing], className)}
      {...props}
    >
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}

export interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  titleId?: string;
  description?: ReactNode;
  /** Typically a ButtonLink, aligned to the right on desktop. */
  action?: ReactNode;
  className?: string;
}

/** Heading block for a section: title left, description/action right on desktop. */
export function SectionHeader({
  eyebrow,
  title,
  titleId,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "mb-12 grid gap-6 md:mb-16 lg:grid-cols-12 lg:items-end lg:gap-x-8",
        className,
      )}
    >
      <div className="lg:col-span-7">
        {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
        <Heading id={titleId} size="h2">
          {title}
        </Heading>
      </div>
      {(description || action) && (
        <div className="flex flex-col items-start gap-6 lg:col-span-4 lg:col-start-9">
          {description && <Text size="body">{description}</Text>}
          {action}
        </div>
      )}
    </header>
  );
}
