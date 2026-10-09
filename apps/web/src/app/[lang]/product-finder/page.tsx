import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { routes } from "@/config/routes";
import { ProductFinder, ProductFinderFromUrl, type FinderLinks } from "@/features/finder/product-finder";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ title: t.pages.finder.title, description: t.pages.finder.description, path: routes.finder });
}

/** Product finder: a few questions lead to the Dekorfix products for a job, in order. */
export default async function ProductFinderPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const copy = t.finder;
  const links: FinderLinks = {
    calculator: href(routes.calculator),
    studio: href(routes.projectStudio),
    contact: href(routes.contact),
  };

  return (
    <div className="container-page pb-section pt-10 md:pt-14">
      <Breadcrumbs
        items={[{ label: t.nav.home, href: href(routes.home) }, { label: t.nav.finder }]}
        label={t.a11y.breadcrumbs}
        className="mb-10 md:mb-14"
      />
      <header className="mb-12 max-w-4xl md:mb-16">
        <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
          <span aria-hidden className="brand-mark" />
          {copy.eyebrow}
        </p>
        <h1 className="mt-6 text-balance text-[clamp(3rem,1rem+6.5vw,7rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-text">
          {copy.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lead text-text-secondary">{copy.intro}</p>
      </header>

      {/* Prerendered at the first question; a ?job= in the address opens that job in the browser. */}
      <Suspense fallback={<ProductFinder copy={copy} links={links} />}>
        <ProductFinderFromUrl copy={copy} links={links} />
      </Suspense>
    </div>
  );
}
