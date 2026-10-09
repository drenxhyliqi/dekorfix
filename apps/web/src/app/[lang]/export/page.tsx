import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import type { CSSProperties } from "react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { MAP_CREDIT } from "@/content/kosovo-map";
import { directionsUrl, distanceKm, factory, stores } from "@/content/stores";
import { StoreLocator, type LocatorStore } from "@/features/stores/store-locator";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ title: t.pages.whereToBuy.title, description: t.pages.whereToBuy.description, path: routes.whereToBuy });
}

/** Points of sale: an animated map of Kosovo beside the list of stores. Store details are placeholders for now. */
export default async function WhereToBuyPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const copy = t.storesPage;

  const items: LocatorStore[] = stores.map((store) => ({
    id: store.id,
    city: store.city,
    municipality: store.municipality,
    lat: store.lat,
    lng: store.lng,
    label: store.label,
    confirmed: store.confirmed,
    ...store.details[locale],
    fromFactoryKm: Math.round(distanceKm(factory, store)),
    mapsUrl: directionsUrl(store),
  }));
  const stats = [
    { value: stores.length, label: copy.stats.stores },
    { value: new Set(stores.map((store) => store.city)).size, label: copy.stats.cities },
    { value: 1, label: copy.stats.factory },
  ];

  return (
    <>
      <div className="container-page pt-10 md:pt-14">
        <Breadcrumbs
          items={[{ label: t.nav.home, href: href(routes.home) }, { label: t.nav.whereToBuy }]}
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

        <aside className="mt-10 flex gap-3 rounded-sm border border-dashed border-border-strong bg-surface-muted px-5 py-4 md:mt-14">
          <span aria-hidden className="brand-mark mt-1.5 shrink-0" />
          <div>
            <p className="text-small font-medium text-text">{copy.placeholderTitle}</p>
            <p className="mt-1 text-small text-text-secondary">{copy.placeholderText}</p>
          </div>
        </aside>
      </div>

      <section aria-label={copy.mapLabel} className="container-page pb-section pt-10 md:pt-14">
        <StoreLocator stores={items} factory={factory} copy={copy} credit={MAP_CREDIT} />
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
