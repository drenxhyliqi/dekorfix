import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { productCategories } from "@/config/navigation";
import { routes } from "@/config/routes";
import { company } from "@/config/site";
import { products } from "@/content/products";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

import "./about.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ title: t.pages.about.title, description: t.pages.about.description, path: routes.about });
}

/**
 * About Dekorfix: who the company is, the certified quality, the plant in
 * Shirokë, the product groups and where to find it. All facts come from
 * dekorfix.net and the site config.
 */
export default async function AboutPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const copy = t.aboutPage;
  const manufacturing = t.home.manufacturing;
  const words = manufacturing.text.split(" ");

  return (
    <>
      <header className="container-page pt-10 md:pt-14">
        <Breadcrumbs
          items={[{ label: t.nav.home, href: href(routes.home) }, { label: t.nav.about }]}
          label={t.a11y.breadcrumbs}
        />
        <p className="mt-10 flex items-center gap-2.5 text-label uppercase text-brand-text md:mt-14">
          <span aria-hidden className="brand-mark" />
          {copy.eyebrow}
        </p>
        <h1 className="ab-title mt-6 max-w-5xl text-balance text-text">{copy.title}</h1>
      </header>

      {/* The plant: framed at first, opening to the full width as it scrolls in. */}
      <div className="ab-hero-photo mt-12 md:mt-16">
        <figure className="ab-hero-frame">
          <Image
            src="/images/photos/plant-loading.webp"
            alt={manufacturing.photos.loading}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </figure>
      </div>

      {/* Who we are: the words darken one after another as the paragraph scrolls through. */}
      <section aria-labelledby="statement-label" className="container-page py-section">
        <div className="grid gap-8 lg:grid-cols-12">
          <p id="statement-label" className="text-label uppercase text-text-tertiary lg:col-span-3 lg:pt-3">
            {copy.statementLabel}
          </p>
          <p
            className="ab-statement text-[clamp(1.75rem,1rem+2.6vw,3.25rem)] font-medium leading-[1.15] tracking-[-0.03em] text-text lg:col-span-9"
            style={{ "--words": words.length } as CSSProperties}
          >
            {words.map((word, index) => (
              <span key={index} className="ab-word" style={{ "--i": index } as CSSProperties}>
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* Certified quality. */}
      <section aria-labelledby="quality-title" className="border-t border-border">
        <div className="container-page py-section-sm">
          <h2 id="quality-title" className="text-h2 text-text">
            {copy.qualityTitle}
          </h2>
          <ul className="mt-10 grid border-t border-border md:grid-cols-2">
            {t.home.credentials.map((item, index) => (
              <li key={item.code} className="ab-credential" data-side={index % 2 === 0 ? "left" : "right"}>
                <span className="flex items-center gap-4 text-[clamp(2.75rem,1.5rem+4vw,5.5rem)] font-semibold leading-none tracking-[-0.05em] text-text">
                  <span aria-hidden className="brand-mark" />
                  {item.code}
                </span>
                <span className="mt-5 block max-w-sm text-body text-text-secondary">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The plant. */}
      <section aria-labelledby="plant-title" className="border-t border-border">
        <div className="container-page py-section-sm">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <h2 id="plant-title" className="text-h2 text-text lg:col-span-7">
              {copy.plantTitle}
            </h2>
            <p className="text-lead text-text-secondary lg:col-span-5">{t.footer.description}</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <Photo src="/images/photos/plant-forklift.webp" alt={manufacturing.photos.forklift} />
            <Photo src="/images/photos/plant-dispatch.webp" alt={manufacturing.photos.dispatch} />
          </div>
        </div>
      </section>

      {/* What we make: the product groups, each to its catalog view. */}
      <section aria-labelledby="range-title" className="border-t border-border">
        <div className="container-page py-section-sm">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 id="range-title" className="text-h2 text-text lg:col-span-7">
              {copy.rangeTitle}
            </h2>
            <p className="text-lead text-text-secondary lg:col-span-5">{t.home.range.description}</p>
          </div>
          <ol className="mt-10 border-t border-border">
            {productCategories.map((category, index) => {
              const packs = products.filter((product) => product.category === category.key).slice(0, 3);
              return (
                <li key={category.key}>
                  <Link href={href(category.path)} className="ab-row group/row">
                    <span className="text-small tabular-nums text-text-tertiary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-h3 text-text transition-colors duration-250 group-hover/row:text-brand">
                        {t.productCategories[category.key].name}
                      </span>
                      <span className="mt-1 block text-small text-text-secondary">
                        {t.productCategories[category.key].description}
                      </span>
                    </span>
                    <span aria-hidden className="ab-row-packs">
                      {packs.map((product) => (
                        <span key={product.slug} className="ab-row-pack">
                          <Image src={product.image} alt="" fill sizes="5rem" className="object-contain" />
                        </span>
                      ))}
                    </span>
                    <ArrowRight
                      aria-hidden
                      className="size-5 shrink-0 text-text-tertiary transition-[color,translate] duration-250 group-hover/row:translate-x-1 group-hover/row:text-brand"
                      strokeWidth={1.5}
                    />
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Find us. */}
      <section aria-labelledby="find-title" className="border-t border-border">
        <div className="container-page grid gap-10 py-section-sm lg:grid-cols-12">
          <h2 id="find-title" className="text-h2 text-text lg:col-span-5">
            {copy.findTitle}
          </h2>
          <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:col-span-7">
            <div className="ab-find sm:col-span-2">
              <MapPin aria-hidden className="size-5 text-brand" strokeWidth={1.75} />
              <address className="not-italic">
                <span className="block text-h4 text-text">{company.legalName}</span>
                <span className="mt-2 block text-body text-text-secondary">
                  {t.address.street}, {t.address.city}, {t.address.country}
                </span>
              </address>
              <a
                href={company.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.9375rem] font-medium text-text hover:text-brand"
              >
                {copy.directions}
                <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.75} />
                <span className="sr-only"> ({t.a11y.newTab})</span>
              </a>
            </div>
            <div className="ab-find">
              <Phone aria-hidden className="size-5 text-brand" strokeWidth={1.75} />
              <span className="text-label uppercase text-text-tertiary">{t.header.call}</span>
              {company.phones.map((phone) => (
                <a key={phone.href} href={phone.href} className="text-h4 tabular-nums text-text hover:text-brand">
                  {phone.display}
                </a>
              ))}
            </div>
            <div className="ab-find">
              <Mail aria-hidden className="size-5 text-brand" strokeWidth={1.75} />
              <span className="text-label uppercase text-text-tertiary">{t.header.email}</span>
              <a href={`mailto:${company.email}`} className="text-h4 text-text [overflow-wrap:anywhere] hover:text-brand">
                {company.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Photo({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="m-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-muted">
        <Image src={src} alt={alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
      <figcaption className="mt-3 text-small text-text-tertiary">{alt}</figcaption>
    </figure>
  );
}
