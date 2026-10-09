import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import type { CSSProperties } from "react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { distanceKm, exportCities, exportCountries, factory } from "@/content/export";
import { MAP_CREDIT } from "@/content/kosovo-map";
import { CityLocator, type LocatorCity } from "@/features/stores/city-locator";
import { ExportExplorer } from "@/features/stores/export-explorer";
import { ExportMap } from "@/features/stores/export-map";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

import "@/features/stores/export.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ title: t.pages.export.title, description: t.pages.export.description, path: routes.export });
}

/**
 * Export: an animated map of Kosovo beside the ten cities Dekorfix supplies,
 * then the six countries in Europe it exports to.
 */
export default async function ExportPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const copy = t.exportPage;
  const europe = copy.europe;

  const cities: LocatorCity[] = exportCities.map((city) => ({
    ...city,
    fromFactoryKm: Math.round(distanceKm(factory, city)),
  }));
  // Nearest first, like a departures board.
  const destinations = exportCountries
    .map((country) => ({
      id: country.id,
      code: country.code,
      name: country.name[locale],
      capital: country.capital.name[locale],
      km: Math.round(distanceKm(factory, country.capital)),
    }))
    .sort((a, b) => a.km - b.km);
  const stats = [
    { value: exportCities.length, label: copy.stats.cities },
    { value: exportCountries.length, label: copy.stats.countries },
    { value: 1, label: copy.stats.factory },
  ];

  return (
    <>
      <div className="container-page pt-10 md:pt-14">
        <Breadcrumbs
          items={[{ label: t.nav.home, href: href(routes.home) }, { label: t.nav.export }]}
          label={t.a11y.breadcrumbs}
          className="mb-10 md:mb-14"
        />
        <header className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
              <span aria-hidden className="brand-mark" />
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 text-balance text-[clamp(3rem,1rem+6.5vw,7rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-text">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-xl text-lead text-text-secondary">{copy.intro}</p>
          </div>
          <dl className="grid grid-cols-3 border-y border-border lg:col-span-5">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="sl-stat py-6 pr-3 [&+&]:border-l [&+&]:border-border [&+&]:pl-4 sm:[&+&]:pl-6"
                style={{ "--i": index } as CSSProperties}
              >
                <dt className="text-caption uppercase tracking-[0.06em] text-text-tertiary sm:text-label">{stat.label}</dt>
                <dd className="mt-3 text-[clamp(2rem,1.5rem+2vw,3rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums text-text">
                  {String(stat.value).padStart(2, "0")}
                </dd>
              </div>
            ))}
          </dl>
        </header>
      </div>

      <section aria-labelledby="kosovo-title" className="container-page pb-section pt-section-sm">
        <div className="mb-10 max-w-2xl md:mb-14">
          <h2 id="kosovo-title" className="text-h2 text-text">
            {copy.kosovo.title}
          </h2>
          <p className="mt-4 text-lead text-text-secondary">{copy.kosovo.text}</p>
        </div>
        <CityLocator cities={cities} factory={factory} copy={copy} credit={MAP_CREDIT} />
      </section>

      <section aria-labelledby="europe-title" className="border-t border-border bg-surface-muted">
        <div className="container-page py-section">
          <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
                <span aria-hidden className="brand-mark" />
                {europe.eyebrow}
              </p>
              <h2 id="europe-title" className="mt-6 text-balance text-h1 text-text">
                {europe.title}
              </h2>
            </div>
            <p className="max-w-xl text-lead text-text-secondary lg:col-span-4">{europe.intro}</p>
          </header>

          <div className="mt-10 md:mt-14">
            <ExportExplorer
              countries={destinations}
              copy={europe}
              map={
                <ExportMap
                  countries={exportCountries.map((country) => ({ ...country, name: country.name[locale] }))}
                  factory={factory}
                  label={europe.mapLabel}
                  factoryLabel={europe.origin}
                />
              }
            />
          </div>

          <div className="mt-8 flex flex-col gap-6 border-t border-border pt-8 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-md text-small text-text-tertiary">{europe.distanceNote}</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div>
                <p className="text-body font-medium text-text">{europe.ctaTitle}</p>
                <p className="mt-1 max-w-sm text-small text-text-secondary">{europe.ctaText}</p>
              </div>
              <ButtonLink
                href={href(routes.contact)}
                variant="secondary"
                className="shrink-0"
                trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
              >
                {europe.ctaAction}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page flex flex-col gap-8 py-section-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-h2 text-text">{copy.ctaTitle}</h2>
            <p className="mt-4 text-lead text-text-secondary">{copy.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href={href(routes.products)}
              variant="accent"
              size="lg"
              trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
            >
              {copy.ctaShop}
            </ButtonLink>
            <ButtonLink href={href(routes.contact)} variant="secondary" size="lg">
              {copy.ctaContact}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
