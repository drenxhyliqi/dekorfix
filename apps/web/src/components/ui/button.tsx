import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group/button inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-sm font-medium tracking-[-0.005em] " +
  "transition-[background-color,border-color,color] duration-150 ease-out " +
  "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-inverse text-inverse-text hover:bg-inverse/80",
  accent: "bg-brand text-white hover:bg-brand-hover",
  secondary:
    "border border-border-strong bg-transparent text-text hover:border-text hover:bg-surface-muted",
  ghost: "bg-transparent text-text hover:bg-surface-muted",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-small",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-6 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon after the label; nudges right on hover (e.g. an arrow). */
  trailingIcon?: ReactNode;
  leadingIcon?: ReactNode;
}

function ButtonContent({
  children,
  leadingIcon,
  trailingIcon,
}: Pick<ButtonOwnProps, "leadingIcon" | "trailingIcon"> & { children: ReactNode }) {
  return (
    <>
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon && (
        <span className="-mr-0.5 transition-transform duration-250 ease-out group-hover/button:translate-x-0.5">
          {trailingIcon}
        </span>
      )}
    </>
  );
}

export type ButtonProps = ComponentProps<"button"> & ButtonOwnProps;

export function Button({
  variant,
  size,
  className,
  leadingIcon,
  trailingIcon,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...props}>
      <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
        {children}
      </ButtonContent>
    </button>
  );
}

export type ButtonLinkProps = ComponentProps<typeof Link> & ButtonOwnProps;

export function ButtonLink({
  variant,
  size,
  className,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
        {children}
      </ButtonContent>
    </Link>
  );
}
