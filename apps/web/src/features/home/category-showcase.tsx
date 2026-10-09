import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { productCategories } from "@/config/navigation";
import { routes } from "@/config/routes";
import { products } from "@/content/products";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

import "./category-showcase.css";

/** Packshots fanned on each card: the front one first. */
const MAX_PACKS = 3;

/**
 * Homepage product range: the Dekorfix categories as cards, Adhesives as the
 * tall feature card beside four compact ones, and the sixth (Mesh) as a wide
 * card across the row below. Each card fans out real packshots from its
 * category and links to that category in the catalog.
 */
export function CategoryShowcase({ t, locale }: { t: Dictionary; locale: Locale }) {
  const copy = t.home.range;

  return (
    <section aria-labelledby="range-title" className="bg-background py-section">
      <div className="container-page">
        <header className="mb-12 flex flex-col gap-8 md:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
              <span aria-hidden className="brand-mark" />
              {copy.eyebrow}
            </p>
            <h2 id="range-title" className="mt-6 text-h1 text-balance text-text">
              {copy.title}
            </h2>
            <p className="mt-6 max-w-xl text-lead text-text-secondary">{copy.description}</p>
          </div>
          <Link
            href={localizePath(locale, routes.products)}
            className="group/all inline-flex shrink-0 items-center gap-3 text-[0.9375rem] font-medium text-text"
          >
            {copy.action}
            <span className="inline-flex size-10 items-center justify-center rounded-sm border border-border-strong transition-colors duration-250 group-hover/all:border-brand group-hover/all:bg-brand group-hover/all:text-white">
              <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
            </span>
          </Link>
        </header>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {productCategories.map((category, index) => {
            const feature = index === 0;
            const wide = index === 5;
            const name = t.productCategories[category.key].name;
            const packs = products.filter((product) => product.category === category.key).slice(0, MAX_PACKS);
            return (
              <li
                key={category.key}
                className={cn(
                  "cs-reveal",
                  feature && "md:col-span-2 lg:col-span-1 lg:row-span-2",
                  wide && "md:col-span-2 lg:col-span-3",
                )}
              >
                <Link
                  href={localizePath(locale, category.path)}
                  className={cn(
                    "cs-card group/card",
                    feature ? "cs-card--feature" : "cs-card--compact",
                    wide && "cs-card--wide",
                  )}
                >
                  <div className="cs-copy">
                    <span className="text-small tabular-nums text-text-tertiary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className={cn("mt-auto text-balance text-text", feature ? "text-h2" : "text-h3")}>{name}</h3>
                    <p className="mt-3 max-w-xs text-small text-text-secondary">
                      {t.productCategories[category.key].description}
                    </p>
                  </div>

                  <span aria-hidden className="cs-arrow">
                    <ArrowUpRight className="size-5" strokeWidth={1.5} />
                  </span>

                  <div aria-hidden className="cs-stack">
                    {packs.map((product, pack) => (
                      <div
                        key={product.slug}
                        className="cs-pack"
                        style={{ "--pack": pack, zIndex: MAX_PACKS - pack } as CSSProperties}
                        data-side={pack === 0 ? "front" : pack === 1 ? "left" : "right"}
                      >
                        <Image
                          src={product.image}
                          alt=""
                          fill
                          sizes={feature ? "(min-width: 1024px) 18vw, 50vw" : "(min-width: 1024px) 12vw, 40vw"}
                          className="object-contain object-bottom"
                        />
                      </div>
                    ))}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
