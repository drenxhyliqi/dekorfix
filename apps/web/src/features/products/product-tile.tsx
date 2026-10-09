import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import "./product-catalog.css";

export interface ProductTileData {
  slug: string;
  name: string;
  categoryLabel: string;
  summary: string;
  image: string;
  href: string;
  /** Published pack sizes, e.g. "5 · 20 kg"; null when none are published. */
  packs: string | null;
}

/**
 * Product card for the catalog and related products: packshot panel, category,
 * name, summary. `action` (e.g. add to cart) sits under the link, not inside it.
 */
export function ProductTile({
  item,
  viewLabel,
  action,
}: {
  item: ProductTileData;
  viewLabel: string;
  action?: ReactNode;
}) {
  const card = (
    <Link href={item.href} className={action ? "pc-card pc-card--shop group/card" : "pc-card group/card"}>
      <div className="pc-shot">
        <Image
          src={item.image}
          alt={`${item.name}, ${item.categoryLabel}`}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
          className="pc-pack object-contain"
        />
        {item.packs && !action && <span className="pc-packs">{item.packs}</span>}
      </div>
      <p className="mt-5 text-label uppercase text-brand-text">{item.categoryLabel}</p>
      <h3 className="mt-2 text-h3 text-text">{item.name}</h3>
      <p className="mt-2 text-small text-text-secondary">{item.summary}</p>
      {!action && (
        <span className="mt-4 inline-flex items-center gap-2 text-small font-medium text-text">
          {viewLabel}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-250 group-hover/card:translate-x-1"
            strokeWidth={1.75}
          />
        </span>
      )}
    </Link>
  );
  if (!action) return card;
  return (
    <div className="flex h-full flex-col">
      {card}
      {action}
    </div>
  );
}
