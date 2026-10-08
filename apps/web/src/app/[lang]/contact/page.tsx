import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { SocialIcon } from "@/components/brand/social-icons";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { routes } from "@/config/routes";
import { company } from "@/config/site";
import { CopyButton } from "@/features/contact/copy-button";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

import "./contact.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ title: t.pages.contact.title, description: t.pages.contact.description, path: routes.contact });
}

/** Contact: the direct lines set large, the plant's address and the social accounts. */
export default async function ContactPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const copy = t.contactPage;
  const cta = t.home.cta;
  const asks = cta.title.endsWith("?");

  const lines = [
    ...company.phones.map((phone) => ({ label: t.header.call, display: phone.display, href: phone.href, value: phone.display })),
    { label: t.header.email, display: company.email, href: `mailto:${company.email}`, value: company.email },
  ];

  return (
    <>
      <header className="container-page pb-section-sm pt-10 md:pt-14">
        <Breadcrumbs
          items={[{ label: t.nav.home, href: href(routes.home) }, { label: t.nav.contact }]}
          label={t.a11y.breadcrumbs}
        />
        <div className="mt-10 grid gap-8 md:mt-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
              <span aria-hidden className="brand-mark" />
              {copy.eyebrow}
            </p>
            <h1 className="ct-title mt-6 text-balance text-text">
              {asks ? cta.title.slice(0, -1) : cta.title}
              {asks && <span className="text-brand">?</span>}
            </h1>
          </div>
          <p className="text-lead text-text-secondary lg:col-span-4">{cta.text}</p>
        </div>
      </header>

      {/* The direct lines, set large. */}
      <section aria-labelledby="lines-title" className="container-page pb-section-sm">
        <h2 id="lines-title" className="sr-only">
          {copy.linesTitle}
        </h2>
        <ul className="border-t border-border">
          {lines.map((line) => (
            <li key={line.href} className="ct-line">
              <span className="ct-line-label text-label uppercase text-text-tertiary">{line.label}</span>
              <a href={line.href} className="ct-line-value group/line">
                <span>{line.display}</span>
                <ArrowUpRight
                  aria-hidden
                  className="ct-line-arrow size-[0.6em] shrink-0"
                  strokeWidth={1.5}
                />
              </a>
              <CopyButton value={line.value} name={line.display} label={copy.copy} copiedLabel={copy.copied} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="visit-title" className="border-t border-border">
        <div className="container-page grid gap-10 py-section-sm lg:grid-cols-12 lg:gap-8">
          {/* Visit the plant. */}
          <div className="lg:col-span-7">
            <div className="ct-visit">
              <Image
                src="/images/photos/plant-dispatch.webp"
                alt={t.home.manufacturing.photos.dispatch}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
              <div className="ct-visit-card">
                <h2 id="visit-title" className="text-h3 text-text">
                  {copy.visitTitle}
                </h2>
                <address className="mt-4 not-italic text-body text-text-secondary">
                  <span className="block font-medium text-text">{company.legalName}</span>
                  {t.address.street}
                  <br />
                  {t.address.city}, {t.address.country}
                </address>
                <a
                  href={company.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-text hover:text-brand"
                >
                  {t.aboutPage.directions}
                  <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.75} />
                  <span className="sr-only"> ({t.a11y.newTab})</span>
                </a>
              </div>
            </div>
          </div>

          {/* Follow. */}
          <div className="flex flex-col lg:col-span-4 lg:col-start-9">
            <h2 className="text-h3 text-text">{copy.followTitle}</h2>
            <ul className="mt-6 grid gap-3">
              {company.social.map((social) => (
                <li key={social.key}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/social flex items-center gap-4 rounded-sm border border-border p-4 transition-colors duration-200 hover:border-brand"
                  >
                    <span className="inline-flex size-12 items-center justify-center rounded-sm bg-surface-muted text-text transition-colors duration-200 group-hover/social:bg-brand group-hover/social:text-white">
                      <SocialIcon network={social.key} className="size-5" />
                    </span>
                    <span className="flex-1 text-h4 text-text">{social.label}</span>
                    <ArrowUpRight
                      aria-hidden
                      className="size-5 text-text-tertiary transition-[color,translate] duration-200 group-hover/social:-translate-y-0.5 group-hover/social:translate-x-0.5 group-hover/social:text-brand"
                      strokeWidth={1.5}
                    />
                    <span className="sr-only"> ({t.a11y.newTab})</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
