import { ArrowRight } from "lucide-react";

import { MediaFrame, type MediaImage } from "@/components/ui/media";

import { CardArrow, CardLink } from "./card-link";

export interface ProductCardProps {
  name: string;
  href: string;
  category?: string;
  description?: string;
  /** Product packshot, shown contained on a neutral surface. */
  image?: MediaImage;
}

/** Emphasises the product image; text is compact underneath. */
export function ProductCard({ name, href, category, description, image }: ProductCardProps) {
  return (
    <article className="group relative flex flex-col">
      <MediaFrame
        ratio="4/5"
        fit="contain"
        image={image}
        zoomOnHover
        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
        placeholderLabel="Packshot pending"
        className="transition-colors duration-250 group-hover:bg-surface-strong"
      />
      <div className="flex items-start justify-between gap-4 pt-5">
        <div className="min-w-0 space-y-1.5">
          {category && <p className="text-label uppercase text-text-tertiary">{category}</p>}
          <h3 className="text-h4 text-text">
            <CardLink href={href}>{name}</CardLink>
          </h3>
          {description && <p className="line-clamp-2 text-small text-text-secondary">{description}</p>}
        </div>
        <span className="mt-6 opacity-0 transition-opacity duration-250 group-hover:opacity-100 group-focus-within:opacity-100">
          <CardArrow>
            <ArrowRight className="size-5" strokeWidth={1.5} />
          </CardArrow>
        </span>
      </div>
    </article>
  );
}
