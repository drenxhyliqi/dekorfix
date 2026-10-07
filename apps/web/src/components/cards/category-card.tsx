import { ArrowRight } from "lucide-react";

import { MediaFrame, type MediaImage } from "@/components/ui/media";

import { CardArrow, CardLink } from "./card-link";

export interface CategoryCardProps {
  name: string;
  href: string;
  description?: string;
  /** Ordinal, e.g. "01". */
  index?: string;
  /** Representative packshot (transparent), shown contained. */
  image?: MediaImage;
}

/** Product category: packshot on a neutral surface, index, name and one line. */
export function CategoryCard({ name, href, description, index, image }: CategoryCardProps) {
  return (
    <article className="group relative flex flex-col">
      <MediaFrame
        ratio="4/5"
        fit="contain"
        image={image}
        zoomOnHover
        sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
        className="transition-colors duration-250 group-hover:bg-surface-strong"
      />
      <div className="flex flex-1 flex-col border-b border-border pb-5 pt-5 transition-colors duration-250 group-hover:border-text">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-h4 text-text">
            <CardLink href={href}>{name}</CardLink>
          </h3>
          {index && <span className="text-small tabular-nums text-text-tertiary">{index}</span>}
        </div>
        {description && <p className="mt-2 text-small text-text-secondary">{description}</p>}
        <span className="mt-auto pt-5">
          <CardArrow>
            <ArrowRight className="size-5" strokeWidth={1.5} />
          </CardArrow>
        </span>
      </div>
    </article>
  );
}
