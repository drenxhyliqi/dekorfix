import { SocialIcon } from "@/components/brand/social-icons";
import { cn } from "@/lib/utils";

import type { SocialLink } from "./nav-types";

const variants = {
  /** Compact icons for dense bars. */
  plain: "size-8 text-text-secondary hover:bg-surface-strong hover:text-text",
  /** Outlined circles that fill with brand red on hover. */
  outline: "size-11 border border-border-strong text-text hover:border-brand hover:bg-brand hover:text-white",
} as const;

/** Icon links to the Dekorfix social accounts; each opens in a new tab. */
export function SocialLinks({
  links,
  newTabLabel,
  variant = "plain",
  className,
}: {
  links: ReadonlyArray<SocialLink>;
  newTabLabel: string;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <ul className={cn("flex items-center", variant === "outline" ? "gap-2" : "gap-1", className)}>
      {links.map((link) => (
        <li key={link.key}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} (${newTabLabel})`}
            className={cn(
              "inline-flex items-center justify-center rounded-sm transition-colors duration-150",
              variants[variant],
            )}
          >
            <SocialIcon network={link.key} className={variant === "outline" ? "size-[1.125rem]" : "size-4"} />
          </a>
        </li>
      ))}
    </ul>
  );
}
