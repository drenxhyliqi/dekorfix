import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SocialNetwork = "facebook" | "instagram";

/*
 * Lucide no longer ships brand icons, so these glyphs are drawn on the same
 * 24px grid and stroke style as the rest of the Lucide set.
 */
const glyphs: Record<SocialNetwork, ReactNode> = {
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  instagram: (
    <>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
};

export function SocialIcon({
  network,
  className,
  strokeWidth = 1.75,
}: {
  network: SocialNetwork;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 shrink-0", className)}
    >
      {glyphs[network]}
    </svg>
  );
}
