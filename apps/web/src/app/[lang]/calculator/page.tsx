import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { HelpBand } from "@/components/layout/help-band";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { routes } from "@/config/routes";
import { products } from "@/content/products";
import { technicalData } from "@/content/technical-data";
import { MaterialCalculator, type CalculatorProduct } from "@/features/calculator/material-calculator";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ title: t.pages.calculator.title, description: t.pages.calculator.description, path: routes.calculator });
}

/** Material calculator: quantity and packs from the coverage Dekorfix publishes. */
export default async function CalculatorPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const copy = t.calculatorPage;
  const asks = copy.title.endsWith("?");

  // Only products with a published coverage rate can be estimated.
  const calculable: CalculatorProduct[] = products.flatMap((product) => {
    const data = technicalData[product.slug];
    if (!data?.coverage) return [];
    return [
      {
        slug: product.slug,
        name: product.name,
        summary: product.summary[locale],
        image: product.image,
        href: href(routes.product(product.slug)),
        coverage: data.coverage,
        packSizesKg: data.packSizesKg,
      },
    ];
  });

  return (
    <>
      <header className="container-page pb-12 pt-10 md:pb-16 md:pt-14">
        <Breadcrumbs
          items={[{ label: t.nav.home, href: href(routes.home) }, { label: t.nav.calculator }]}
          label={t.a11y.breadcrumbs}
        />
        <div className="mt-10 grid gap-8 md:mt-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
              <span aria-hidden className="brand-mark" />
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 text-[clamp(3rem,1rem+6.5vw,7.5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-balance text-text">
              {asks ? copy.title.slice(0, -1) : copy.title}
              {asks && <span className="text-brand">?</span>}
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-lead text-text-secondary">{copy.description}</p>
            <Link
              href={href(routes.projectStudio)}
              className="group/studio mt-5 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-text"
            >
              {copy.studio}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover/studio:translate-x-1"
                strokeWidth={1.75}
              />
            </Link>
          </div>
        </div>
      </header>

      <section aria-label={copy.eyebrow} className="container-page pb-section">
        <MaterialCalculator products={calculable} labels={copy} locale={locale} />
      </section>

      <HelpBand t={t} locale={locale} />
    </>
  );
}
