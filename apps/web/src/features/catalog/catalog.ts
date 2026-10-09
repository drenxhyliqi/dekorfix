import type { PublicProduct } from "@dekorfix/shared";
import { cacheLife, cacheTag } from "next/cache";

import type { ProductCategoryKey } from "@/config/navigation";
import { products as builtIn } from "@/content/products";
import { technicalData } from "@/content/technical-data";
import type { Locale } from "@/i18n/config";
import { apiRequest } from "@/lib/api";

/**
 * The product catalogue as the website shows it: published products from the
 * API (edited in the admin), in display order. If the API cannot be reached
 * (e.g. a frontend-only deploy), the products built into the site are used.
 *
 * Cached under the "products" tag; the admin's save actions refresh it.
 */

export const PRODUCTS_TAG = "products";

export interface CatalogProduct {
  slug: string;
  name: string;
  category: ProductCategoryKey;
  unit: "pack" | "roll";
  summary: Record<Locale, string>;
  description: Record<Locale, string | null>;
  image: string;
  /** Pack sizes in kg; empty when none are published yet. */
  packSizesKg: number[];
  /** Average coverage in m² per kg, or null when not published. */
  coverage: { minM2PerKg: number; maxM2PerKg: number } | null;
}

/** Shown when a product has no image yet. */
export const PLACEHOLDER_IMAGE = "/brand/dekorfix-logo.png";

function fromApi(product: PublicProduct): CatalogProduct {
  const min = product.coverage_min_m2_per_kg === null ? null : Number(product.coverage_min_m2_per_kg);
  const max = product.coverage_max_m2_per_kg === null ? null : Number(product.coverage_max_m2_per_kg);
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    unit: product.unit,
    summary: { sq: product.summary_sq, en: product.summary_en },
    description: { sq: product.description_sq, en: product.description_en },
    image: product.image || PLACEHOLDER_IMAGE,
    packSizesKg: product.pack_sizes_kg.map(Number),
    coverage: min !== null && max !== null ? { minM2PerKg: min, maxM2PerKg: max } : null,
  };
}

const CATEGORY_ORDER: ProductCategoryKey[] = ["adhesives", "facades", "bases", "paints", "plasters", "mesh"];

function fallback(): CatalogProduct[] {
  return [...builtIn]
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category))
    .map((product) => {
      const data = technicalData[product.slug];
      return {
        slug: product.slug,
        name: product.name,
        category: product.category,
        unit: product.category === "mesh" ? "roll" : "pack",
        summary: product.summary,
        description: { sq: null, en: null },
        image: product.image,
        packSizesKg: data?.packSizesKg ?? [],
        coverage: data?.coverage ?? null,
      };
    });
}

export async function getCatalog(): Promise<CatalogProduct[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("minutes");
  try {
    const products = await apiRequest<PublicProduct[]>("/api/v1/products");
    return products.map(fromApi);
  } catch {
    // Kept for a short time only (cacheLife minutes), then the API is tried again.
    return fallback();
  }
}

export async function getCatalogProduct(slug: string): Promise<CatalogProduct | undefined> {
  return (await getCatalog()).find((product) => product.slug === slug);
}

/** Products by slug, in the order given, skipping any that are not published. */
export function pick(catalog: CatalogProduct[], slugs: readonly string[]): CatalogProduct[] {
  return slugs.map((slug) => catalog.find((product) => product.slug === slug)).filter((product): product is CatalogProduct => Boolean(product));
}

/** Orderable pack sizes; `[null]` when none is published yet (Dekorfix confirms it with the order). */
export function packOptionsOf(product: Pick<CatalogProduct, "packSizesKg">): Array<number | null> {
  return product.packSizesKg.length ? [...product.packSizesKg] : [null];
}
