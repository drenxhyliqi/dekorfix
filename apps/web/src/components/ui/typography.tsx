import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HeadingSize = "display" | "h1" | "h2" | "h3" | "h4";

const headingSizes: Record<HeadingSize, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
};

export interface HeadingProps {
  /** Semantic element. Visual size is set separately with `size`. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  size?: HeadingSize;
  className?: string;
  id?: string;
  children: ReactNode;
}

export function Heading({ as: Tag = "h2", size = "h2", className, ...props }: HeadingProps) {
  return <Tag className={cn(headingSizes[size], "text-balance text-text", className)} {...props} />;
}

type TextSize = "lead" | "body" | "small" | "caption";
type TextTone = "default" | "secondary" | "tertiary";

const textSizes: Record<TextSize, string> = {
  lead: "text-lead",
  body: "text-body",
  small: "text-small",
  caption: "text-caption",
};

const textTones: Record<TextTone, string> = {
  default: "text-text",
  secondary: "text-text-secondary",
  tertiary: "text-text-tertiary",
};

export interface TextProps {
  as?: "p" | "span" | "div" | "li" | "dd";
  size?: TextSize;
  tone?: TextTone;
  className?: string;
  children: ReactNode;
}

export function Text({
  as: Tag = "p",
  size = "body",
  tone = "secondary",
  className,
  children,
}: TextProps) {
  return <Tag className={cn(textSizes[size], textTones[tone], "text-pretty", className)}>{children}</Tag>;
}

/** Small uppercase label above headings, marked with the slanted brand mark. */
export function Eyebrow({
  children,
  className,
  mark = true,
}: {
  children: ReactNode;
  className?: string;
  mark?: boolean;
}) {
  return (
    <p className={cn("flex items-center gap-2.5 text-label uppercase text-text-secondary", className)}>
      {mark && <span aria-hidden className="brand-mark" />}
      {children}
    </p>
  );
}
