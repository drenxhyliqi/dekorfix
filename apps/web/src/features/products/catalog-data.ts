import { productCategories, type ProductCategoryKey } from "@/config/navigation";
import { routes } from "@/config/routes";
import type { ProductSummary } from "@/content/products";
import { technicalData } from "@/content/technical-data";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

import type { ProductTileData } from "./product-tile";

/** Published pack sizes as "5 · 20 kg", or null when none are published. */
export function formatPacks(slug: string): string | null {
  const sizes = technicalData[slug]?.packSizesKg;
  return sizes?.length ? `${sizes.join(" · ")} kg` : null;
}

/** Published average coverage as "2–4 m²/kg", or null when none is published. */
export function formatCoverage(slug: string, locale: Locale): string | null {
  const coverage = technicalData[slug]?.coverage;
  if (!coverage) return null;
  const number = new Intl.NumberFormat(locale === "sq" ? "sq-AL" : "en-GB", { maximumFractionDigits: 1 });
  return `${number.format(coverage.minM2PerKg)}–${number.format(coverage.maxM2PerKg)} m²/kg`;
}

/** Card data for one product, in the given language. */
export function toTile(product: ProductSummary, t: Dictionary, locale: Locale): ProductTileData {
  return {
    slug: product.slug,
    name: product.name,
    categoryLabel: t.productCategories[product.category].name,
    summary: product.summary[locale],
    image: product.image,
    href: localizePath(locale, routes.product(product.slug)),
    packs: formatPacks(product.slug),
  };
}

/** Catalog order of the categories (as on dekorfix.net). */
export const categoryOrder: ProductCategoryKey[] = productCategories.map((category) => category.key);

/**
 * Where each category sits in the layer system (home "layer by layer"):
 * 0 prepare, 1 bond, 2 level & plaster, 3 finish.
 */
export const LAYER_OF_CATEGORY: Record<ProductCategoryKey, number> = {
  bases: 0,
  adhesives: 1,
  plasters: 2,
  // Embedded in the base coat or plaster.
  mesh: 2,
  facades: 3,
  paints: 3,
};
