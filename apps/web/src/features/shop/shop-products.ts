import type { ProductCategoryKey } from "@/config/navigation";
import { routes } from "@/config/routes";
import { products } from "@/content/products";
import { packOptions } from "@/content/shop";
import { solutions } from "@/content/solutions";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** What the shop needs about a product, in one language (passed to client components). */
export interface ShopProduct {
  slug: string;
  name: string;
  category: ProductCategoryKey;
  categoryLabel: string;
  summary: string;
  image: string;
  href: string;
  /** Solution keys (jobs) the product is used for. */
  uses: string[];
  /** Orderable pack sizes in kg; `[null]` when none is published yet. */
  packs: Array<number | null>;
  /** Bags and buckets are weighed; mesh is sold by the roll. */
  unit: "pack" | "roll";
}

export function shopProducts(t: Dictionary, locale: Locale): ShopProduct[] {
  return products.map((product) => ({
    slug: product.slug,
    name: product.name,
    category: product.category,
    categoryLabel: t.productCategories[product.category].name,
    summary: product.summary[locale],
    image: product.image,
    href: localizePath(locale, routes.product(product.slug)),
    uses: solutions.filter((solution) => solution.products.includes(product.slug)).map((solution) => solution.key),
    packs: packOptions(product.slug),
    unit: product.category === "mesh" ? "roll" : "pack",
  }));
}
