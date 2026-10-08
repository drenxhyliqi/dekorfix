import type { Metadata } from "next";
import { Suspense } from "react";

import { HelpBand } from "@/components/layout/help-band";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { productCategories } from "@/config/navigation";
import { routes } from "@/config/routes";
import { products } from "@/content/products";
import { categoryOrder, toTile } from "@/features/products/catalog-data";
import {
  CatalogFromUrl,
  ProductCatalog,
  type CatalogCategory,
  type CatalogItem,
  type CatalogProps,
} from "@/features/products/product-catalog";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ title: t.pages.products.title, description: t.pages.products.description, path: routes.products });
}

export default async function ProductsPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const copy = t.catalog;

  // Products in catalog order: by category, then as listed.
  const items: CatalogItem[] = [...products]
    .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))
    .map((product) => ({ ...toTile(product, t, locale), category: product.category }));
  const categories: CatalogCategory[] = productCategories.map((category) => ({
    key: category.key,
    label: t.productCategories[category.key].name,
    description: t.productCategories[category.key].description,
    href: href(category.path),
    count: items.filter((item) => item.category === category.key).length,
  }));
  const catalog: CatalogProps = {
    items,
    categories,
    allHref: href(routes.products),
    labels: {
      filter: copy.filterLabel,
      all: copy.all,
      count: copy.count,
      countOne: copy.countOne,
      view: t.home.featured.view,
    },
  };

  return (
    <>
      <header className="container-page pb-12 pt-10 md:pb-16 md:pt-14">
        <Breadcrumbs
          items={[{ label: t.nav.home, href: href(routes.home) }, { label: t.nav.products }]}
          label={t.a11y.breadcrumbs}
          className="mb-10 md:mb-14"
        />
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
              <span aria-hidden className="brand-mark" />
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 text-[clamp(3rem,1rem+6.5vw,7rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-text">
              {copy.title}
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-lead text-text-secondary">{t.home.hero.description}</p>
            <p className="mt-4 text-small tabular-nums text-text-tertiary">
              {copy.summary.replace("{products}", String(items.length)).replace("{groups}", String(categories.length))}
            </p>
          </div>
        </div>
      </header>

      {/* Prerendered with every product; the address's ?category= filters it in the browser. */}
      <Suspense fallback={<ProductCatalog {...catalog} category={null} />}>
        <CatalogFromUrl {...catalog} />
      </Suspense>

      <HelpBand t={t} locale={locale} />
    </>
  );
}
