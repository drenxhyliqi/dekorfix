import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type MediaRatio = "1/1" | "4/5" | "3/4" | "4/3" | "3/2" | "16/9" | "21/9";

const ratios: Record<MediaRatio, string> = {
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
};

export interface MediaImage {
  src: string;
  alt: string;
}

export interface MediaFrameProps {
  ratio?: MediaRatio;
  image?: MediaImage;
  /** `cover` for photography, `contain` for product packshots. */
  fit?: "cover" | "contain";
  sizes?: string;
  priority?: boolean;
  /** Scales the image slightly when an ancestor `.group` is hovered. */
  zoomOnHover?: boolean;
  placeholderLabel?: string;
  className?: string;
  children?: ReactNode;
}

/** Fixed-ratio image frame. Renders a clearly marked placeholder when no image is given. */
export function MediaFrame({
  ratio = "4/3",
  image,
  fit = "cover",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority,
  zoomOnHover,
  placeholderLabel,
  className,
  children,
}: MediaFrameProps) {
  return (
    <div className={cn("relative overflow-hidden bg-surface-muted", ratios[ratio], className)}>
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            fit === "cover" ? "object-cover" : "object-contain p-[12%]",
            zoomOnHover &&
              "transition-transform duration-700 ease-out group-hover:scale-[1.03]",
          )}
        />
      ) : (
        <MediaPlaceholder label={placeholderLabel} ratio={ratio} />
      )}
      {children}
    </div>
  );
}

/** Neutral hatched placeholder, so missing photography is never mistaken for real assets. */
export function MediaPlaceholder({
  label = "Image pending",
  ratio,
  className,
}: {
  label?: string;
  ratio?: MediaRatio;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "absolute inset-0 flex items-end justify-between bg-surface-muted p-4 text-caption text-text-tertiary",
        "bg-[repeating-linear-gradient(135deg,transparent_0_11px,var(--color-border)_11px_12px)]",
        className,
      )}
    >
      <span className="bg-surface-muted px-1.5 py-0.5 uppercase tracking-[0.08em]">{label}</span>
      {ratio && <span className="bg-surface-muted px-1.5 py-0.5 tabular-nums">{ratio.replace("/", ":")}</span>}
    </div>
  );
}
