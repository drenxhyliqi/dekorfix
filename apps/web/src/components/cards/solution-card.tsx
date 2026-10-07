import { ArrowRight } from "lucide-react";

import { MediaFrame, type MediaImage } from "@/components/ui/media";

import { CardArrow, CardLink } from "./card-link";

export interface SolutionCardProps {
  title: string;
  href: string;
  description?: string;
  /** Ordinal shown above the title, e.g. "01". */
  index?: string;
  image?: MediaImage;
  linkLabel?: string;
}

/** System / application card: index, title and short explanation over a rule. */
export function SolutionCard({
  title,
  href,
  description,
  index,
  image,
  linkLabel = "Learn more",
}: SolutionCardProps) {
  return (
    <article className="group relative flex h-full flex-col">
      {image !== undefined && (
        <MediaFrame ratio="3/4" image={image} zoomOnHover className="mb-6" sizes="(min-width: 1024px) 33vw, 100vw" />
      )}
      <div className="flex flex-1 flex-col border-t border-border-strong pt-6 transition-colors duration-250 group-hover:border-text">
        {index && <p className="mb-8 text-small tabular-nums text-text-tertiary">{index}</p>}
        <h3 className="text-h3 text-text">
          <CardLink href={href}>{title}</CardLink>
        </h3>
        {description && <p className="mt-3 max-w-prose text-body text-text-secondary">{description}</p>}
        <p aria-hidden className="mt-auto flex items-center gap-2 pt-8 text-small font-medium text-text">
          {linkLabel}
          <CardArrow>
            <ArrowRight className="size-4" strokeWidth={1.75} />
          </CardArrow>
        </p>
      </div>
    </article>
  );
}
