import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import type { ProductSummary } from "@/content/products";
import { LAYER_COLORS } from "@/features/home/layer-wall";
import { cn } from "@/lib/utils";

import "./solutions.css";

/**
 * A solution as a card: the colour of its wall layer along the top, the job,
 * what it takes, and its products' packshots fanned in the corner.
 */
export function SolutionCard({
  index,
  title,
  text,
  href,
  layer,
  products,
  wide,
}: {
  index: number;
  title: string;
  text: string;
  href: string;
  layer: number;
  products: ProductSummary[];
  /** Spans two columns on wide screens. */
  wide?: boolean;
}) {
  const packs = products.slice(0, 3);
  return (
    <Link
      href={href}
      className={cn("sl-card group/card", wide && "sl-card--wide")}
      style={{ "--layer": LAYER_COLORS[layer], "--packs": packs.length } as CSSProperties}
    >
      <span aria-hidden className="sl-card-bar" />
      <div className="sl-card-copy">
        <span className="text-small tabular-nums text-text-tertiary">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="mt-auto pt-10 text-h3 text-balance text-text">{title}</h3>
        <p className="mt-3 max-w-sm text-small text-text-secondary">{text}</p>
        <p className="mt-4 text-small font-medium text-text">{products.map((product) => product.name).join(" · ")}</p>
      </div>
      <span aria-hidden className="sl-card-arrow">
        <ArrowUpRight className="size-5" strokeWidth={1.5} />
      </span>
      <div aria-hidden className="sl-card-packs">
        {packs.map((product, i) => (
          <span key={product.slug} className="sl-card-pack" style={{ "--n": i } as CSSProperties}>
            <Image src={product.image} alt="" fill sizes="10rem" className="object-contain object-bottom" />
          </span>
        ))}
      </div>
    </Link>
  );
}
