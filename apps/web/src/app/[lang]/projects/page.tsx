import type { Metadata } from "next";

import { HelpBand } from "@/components/layout/help-band";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { routes } from "@/config/routes";
import { galleryPhotos } from "@/content/gallery";
import { Gallery } from "@/features/gallery/gallery";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ title: t.pages.projects.title, description: t.pages.projects.description, path: routes.projects });
}

/** Projects: a gallery of Dekorfix on site, finished interiors and the factory. */
export default async function ProjectsPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const copy = t.galleryPage;

  return (
    <>
      <div className="container-page pb-section pt-10 md:pt-14">
        <Breadcrumbs
          items={[{ label: t.nav.home, href: href(routes.home) }, { label: t.nav.projects }]}
          label={t.a11y.breadcrumbs}
          className="mb-10 md:mb-14"
        />
        <header className="mb-10 grid gap-8 md:mb-14 lg:grid-cols-12 lg:items-end">
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
            <p className="text-lead text-text-secondary">{copy.intro}</p>
            <p className="mt-4 text-small tabular-nums text-text-tertiary">
              {copy.count.replace("{n}", String(galleryPhotos.length))}
            </p>
          </div>
        </header>

        <Gallery
          items={galleryPhotos.map(({ alt, ...photo }) => ({ ...photo, alt: alt[locale] }))}
          copy={copy}
        />
      </div>

      <HelpBand t={t} locale={locale} />
    </>
  );
}
