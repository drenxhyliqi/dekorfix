import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { routes } from "@/config/routes";
import { getProducts } from "@/content/products";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

import { RailControls } from "./rail-controls";
import "./featured-products.css";

/** One or two from each category, in the order a wall is built up. */
const FEATURED = [
  "styrofiber",
  "thermofix",
  "cerafix",
  "beton-kontakt",
  "gletex",
  "niveler",
  "fasader",
  "premium",
];

/**
 * Homepage featured products: a snapping rail of large product cards that runs
 * off the right edge of the page, with arrows on wide screens.
 */
export function FeaturedProducts({ t, locale }: { t: Dictionary; locale: Locale }) {
  const copy = t.home.featured;

  return (
    <section aria-labelledby="featured-title" className="overflow-hidden bg-background py-section">
      <div className="container-page">
        <header className="mb-12 flex flex-col gap-8 md:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
              <span aria-hidden className="brand-mark" />
              {copy.eyebrow}
            </p>
            <h2 id="featured-title" className="mt-6 text-h1 text-balance text-text">
              {copy.title}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href={localizePath(locale, routes.products)}
              className="text-[0.9375rem] font-medium text-text underline-offset-4 hover:underline"
            >
              {copy.action}
            </Link>
            <RailControls railId="featured-rail" previousLabel={copy.previous} nextLabel={copy.next} />
          </div>
        </header>
      </div>

      <ul id="featured-rail" className="fp-rail">
        {getProducts(FEATURED).map((product) => {
          const category = t.productCategories[product.category].name;
          return (
            <li key={product.slug} className="fp-item">
              <Link href={localizePath(locale, routes.product(product.slug))} className="fp-card group/card">
                <div className="fp-shot">
                  <Image
                    src={product.image}
                    alt={`${product.name}, ${category}`}
                    fill
                    sizes="(min-width: 1024px) 22rem, 70vw"
                    className="fp-pack object-contain"
                  />
                </div>
                <p className="mt-6 text-label uppercase text-brand-text">{category}</p>
                <h3 className="mt-2 text-h3 text-text">{product.name}</h3>
                <p className="mt-2 text-small text-text-secondary">{product.summary[locale]}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-small font-medium text-text">
                  {copy.view}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-250 group-hover/card:translate-x-1"
                    strokeWidth={1.75}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
