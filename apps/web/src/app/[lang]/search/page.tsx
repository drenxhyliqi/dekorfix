import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { finderJobs, productCategories } from "@/config/navigation";
import { routes } from "@/config/routes";
import { products } from "@/content/products";
import { SiteSearch, SiteSearchFromUrl, type SearchItem, type SiteSearchProps } from "@/features/search/site-search";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ title: t.pages.search.title, description: t.pages.search.description, path: routes.search });
}

/** Site search: everything is indexed here, in the page's language, and searched in the browser. */
export default async function SearchPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const copy = t.searchPage;

  const items: SearchItem[] = [
    ...products.map((product) => ({
      id: `product-${product.slug}`,
      group: "products" as const,
      title: product.name,
      text: product.summary[locale],
      keywords: t.productCategories[product.category].name,
      meta: t.productCategories[product.category].name,
      href: href(routes.product(product.slug)),
      image: product.image,
    })),
    ...finderJobs.map((job) => ({
      id: `finder-${job.key}`,
      group: "solutions" as const,
      title: t.finder.jobs[job.key].title,
      text: t.finder.jobs[job.key].text,
      href: href(job.path),
      image: products.find((product) => product.slug === t.finder.jobs[job.key].image)?.image,
    })),
    ...productCategories.map((category) => ({
      id: `category-${category.key}`,
      group: "categories" as const,
      title: t.productCategories[category.key].name,
      text: t.productCategories[category.key].description,
      href: href(category.path),
      image: products.find((product) => product.category === category.key)?.image,
    })),
    // Only pages with real content; placeholders are left out until they are built.
    ...(
      [
        ["home", routes.home],
        ["products", routes.products],
        ["finder", routes.finder],
        ["projects", routes.projects],
        ["export", routes.export],
        ["projectStudio", routes.projectStudio],
        ["about", routes.about],
        ["contact", routes.contact],
      ] as const
    ).map(([key, path]) => ({
      id: `page-${key}`,
      group: "pages" as const,
      title: key === "home" ? t.nav.home : t.pages[key].title,
      text: t.pages[key].description,
      href: href(path),
    })),
  ];

  const props: SiteSearchProps = {
    items,
    suggestions: ["Styrofiber", "Cerafix", "Gletex", "Fasadex", "Beton Kontakt"],
    browse: [
      { label: t.catalog.all, href: href(routes.products) },
      { label: t.nav.finder, href: href(routes.finder) },
      { label: t.nav.projectStudio, href: href(routes.projectStudio) },
      { label: t.nav.contact, href: href(routes.contact) },
    ],
    labels: copy,
  };

  return (
    <div className="container-page pb-section pt-10 md:pt-14">
      <Breadcrumbs
        items={[{ label: t.nav.home, href: href(routes.home) }, { label: copy.eyebrow }]}
        label={t.a11y.breadcrumbs}
      />
      <h1 className="mt-10 flex items-center gap-2.5 text-label uppercase text-brand-text md:mt-14">
        <span aria-hidden className="brand-mark" />
        {copy.label}
      </h1>
      <div className="mt-6">
        <Suspense fallback={<SiteSearch {...props} initialQuery="" />}>
          <SiteSearchFromUrl {...props} />
        </Suspense>
      </div>
    </div>
  );
}
