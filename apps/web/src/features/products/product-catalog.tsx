"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import "./product-catalog.css";
import { ProductTile, type ProductTileData } from "./product-tile";

export interface CatalogItem extends ProductTileData {
  category: string;
}

export interface CatalogCategory {
  key: string;
  label: string;
  description: string;
  href: string;
  count: number;
}

export interface CatalogProps {
  items: CatalogItem[];
  categories: CatalogCategory[];
  allHref: string;
  labels: { filter: string; all: string; count: string; countOne: string; view: string };
}

const countLabel = (labels: CatalogProps["labels"], n: number) =>
  (n === 1 ? labels.countOne : labels.count).replace("{n}", String(n));

/** The catalog filtered by the `?category=` in the address. */
export function CatalogFromUrl(props: CatalogProps) {
  return <ProductCatalog {...props} category={useSearchParams().get("category")} />;
}

/**
 * Category chips (pinned under the header) over a grid of product cards.
 * Chips are links, so a filtered view has its own shareable address.
 */
export function ProductCatalog({
  items,
  categories,
  allHref,
  labels,
  category,
}: CatalogProps & { category: string | null }) {
  const active = categories.find((entry) => entry.key === category) ?? null;
  const shown = active ? items.filter((item) => item.category === active.key) : items;

  return (
    <div>
      <nav aria-label={labels.filter} className="pc-filter">
        <ul className="pc-chips container-page">
          <li>
            <Chip href={allHref} current={!active} count={items.length}>
              {labels.all}
            </Chip>
          </li>
          {categories.map((entry) => (
            <li key={entry.key}>
              <Chip href={entry.href} current={active?.key === entry.key} count={entry.count}>
                {entry.label}
              </Chip>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-page pb-section pt-10 md:pt-14">
        <div className="mb-10 flex flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-h2 text-text">{active ? active.label : labels.all}</h2>
            {active && <p className="mt-3 text-lead text-text-secondary">{active.description}</p>}
          </div>
          <p className="text-small tabular-nums text-text-tertiary" aria-live="polite">
            {countLabel(labels, shown.length)}
          </p>
        </div>

        {/* Keyed by the filter, so the cards rise in again when it changes. */}
        <ul key={active?.key ?? "all"} className="pc-grid">
          {shown.map((item, index) => (
            <li key={item.slug} className="pc-item" style={{ "--i": index } as CSSProperties}>
              <ProductTile item={item} viewLabel={labels.view} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Chip({
  href,
  current,
  count,
  children,
}: {
  href: string;
  current: boolean;
  count: number;
  children: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={current ? "page" : undefined}
      className={cn("pc-chip", current && "pc-chip--current")}
    >
      {children}
      <span className="pc-chip-count tabular-nums">{count}</span>
    </Link>
  );
}
