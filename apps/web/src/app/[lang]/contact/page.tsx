import { ArrowUpRight, ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Suspense, type CSSProperties } from "react";

import { SocialIcon } from "@/components/brand/social-icons";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { routes } from "@/config/routes";
import { company } from "@/config/site";
import { distanceKm, factory } from "@/content/export";
import { ContactForm, ContactFormFromUrl } from "@/features/contact/contact-form";
import { CopyButton } from "@/features/contact/copy-button";
import { PlantMap } from "@/features/contact/plant-map";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

import "./contact.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ title: t.pages.contact.title, description: t.pages.contact.description, path: routes.contact });
}

/** City centres for the "how far we are" list and map (straight-line distances from the plant). */
const CITIES = [
  { name: "Prishtinë", lat: 42.6629, lng: 21.1655, side: "right" },
  { name: "Mitrovicë", lat: 42.8914, lng: 20.866, side: "right" },
  { name: "Pejë", lat: 42.6593, lng: 20.2887, side: "left" },
  { name: "Gjakovë", lat: 42.3803, lng: 20.4308, side: "left" },
  { name: "Prizren", lat: 42.2139, lng: 20.7397, side: "left" },
  { name: "Ferizaj", lat: 42.3702, lng: 21.1553, side: "right" },
] as const;

/**
 * Contact: quick ways to reach Dekorfix, the message form beside the direct
 * lines, where the plant is, and answers to common questions.
 */
export default async function ContactPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const copy = t.contactPage;
  const [phone] = company.phones;
  const cities = CITIES.map((city) => ({ ...city, km: Math.round(distanceKm(factory, city)) }));
  const formProps = {
    locale,
    copy: copy.form,
    privacyHref: href(routes.privacy),
    contact: { phone: phone.display, email: company.email },
  };

  const quick = [
    { icon: Phone, label: copy.quick.call, value: phone.display, href: phone.href },
    { icon: Mail, label: copy.quick.email, value: company.email, href: `mailto:${company.email}` },
    { icon: MapPin, label: copy.quick.visit, value: `${t.address.street}, ${t.address.city}`, href: company.mapsHref, external: true },
  ];

  return (
    <>
      <header className="ct-hero">
        <div className="container-page pb-12 pt-10 md:pb-16 md:pt-14">
          <Breadcrumbs items={[{ label: t.nav.home, href: href(routes.home) }, { label: t.nav.contact }]} label={t.a11y.breadcrumbs} />
          <div className="mt-10 grid gap-8 md:mt-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
                <span aria-hidden className="brand-mark" />
                {copy.eyebrow}
              </p>
              <h1 className="ct-title mt-6 text-text">
                {copy.title}
                <span className="text-brand">.</span>
              </h1>
            </div>
            <p className="max-w-xl text-lead text-text-secondary lg:col-span-5">{copy.intro}</p>
          </div>

          <ul className="mt-12 grid gap-3 md:mt-16 md:grid-cols-3">
            {quick.map((item, index) => (
              <li key={item.label} className="ct-rise min-w-0" style={{ "--i": index } as CSSProperties}>
                <a
                  href={item.href}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="ct-quick group/quick"
                >
                  <span aria-hidden className="ct-quick-icon">
                    <item.icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-small text-text-tertiary">{item.label}</span>
                    <span className="mt-0.5 block truncate text-[1.0625rem] font-semibold text-text">{item.value}</span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 shrink-0 text-text-tertiary transition-[color,translate] duration-200 group-hover/quick:-translate-y-0.5 group-hover/quick:translate-x-0.5 group-hover/quick:text-brand"
                    strokeWidth={1.5}
                  />
                  {item.external && <span className="sr-only"> ({t.a11y.newTab})</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* The form, with the direct lines beside it. */}
      <section id="message" aria-labelledby="form-title" className="container-page scroll-mt-24 py-section-sm">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="ct-card lg:col-span-7">
            <h2 id="form-title" className="text-h2 text-text">
              {copy.form.title}
            </h2>
            <p className="mt-3 text-body text-text-secondary">{copy.form.text}</p>
            <div className="mt-8">
              <Suspense fallback={<ContactForm {...formProps} />}>
                <ContactFormFromUrl {...formProps} />
              </Suspense>
            </div>
          </div>

          <aside aria-labelledby="details-title" className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <h2 id="details-title" className="text-label uppercase text-text-tertiary">
                {copy.details.title}
              </h2>
              <dl className="mt-5 divide-y divide-border border-y border-border">
                <div className="py-5">
                  <dt className="text-small text-text-tertiary">{copy.details.phones}</dt>
                  {company.phones.map((line) => (
                    <dd key={line.href} className="mt-2 flex items-center justify-between gap-4">
                      <a href={line.href} className="text-h4 tabular-nums text-text hover:text-brand">
                        {line.display}
                      </a>
                      <CopyButton value={line.display} name={line.display} label={copy.copy} copiedLabel={copy.copied} />
                    </dd>
                  ))}
                </div>
                <div className="py-5">
                  <dt className="text-small text-text-tertiary">{copy.details.email}</dt>
                  <dd className="mt-2 flex items-center justify-between gap-4">
                    <a href={`mailto:${company.email}`} className="text-h4 text-text hover:text-brand">
                      {company.email}
                    </a>
                    <CopyButton value={company.email} name={company.email} label={copy.copy} copiedLabel={copy.copied} />
                  </dd>
                </div>
                <div className="py-5">
                  <dt className="text-small text-text-tertiary">{copy.details.address}</dt>
                  <dd className="mt-2">
                    <address className="not-italic text-body text-text">
                      <span className="block font-medium">{company.legalName}</span>
                      {t.address.street}
                      <br />
                      {t.address.city}, {t.address.country}
                    </address>
                  </dd>
                </div>
              </dl>

              <p className="mt-8 text-small text-text-tertiary">{copy.details.follow}</p>
              <ul className="mt-3 flex gap-2">
                {company.social.map((social) => (
                  <li key={social.key}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${social.label} (${t.a11y.newTab})`}
                      className="inline-flex size-12 items-center justify-center rounded-sm border border-border text-text transition-colors duration-200 hover:border-brand hover:bg-brand hover:text-white"
                    >
                      <SocialIcon network={social.key} className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Where the plant is. */}
      <section aria-labelledby="location-title" className="border-y border-border bg-surface-muted">
        <div className="container-page grid gap-10 py-section-sm lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
              <span aria-hidden className="brand-mark" />
              {copy.location.eyebrow}
            </p>
            <h2 id="location-title" className="mt-5 text-h2 text-text">
              {copy.location.title}
            </h2>
            <p className="mt-4 text-lead text-text-secondary">{copy.location.text}</p>

            <div className="ct-photo mt-8">
              <Image
                src="/images/photos/plant-dispatch.webp"
                alt={copy.location.plantPhoto}
                fill
                sizes="(min-width: 1024px) 35vw, 100vw"
                className="object-cover"
              />
            </div>

            <a href={company.mapsHref} target="_blank" rel="noopener noreferrer" className="ct-directions group/dir mt-6">
              <MapPin aria-hidden className="size-4" strokeWidth={1.75} />
              {copy.location.directions}
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover/dir:-translate-y-0.5 group-hover/dir:translate-x-0.5"
                strokeWidth={1.75}
              />
              <span className="sr-only"> ({t.a11y.newTab})</span>
            </a>
          </div>

          <div className="lg:col-span-7">
            <div className="ct-map-frame">
              <PlantMap plant={factory} cities={cities} label={copy.location.mapLabel} plantLabel="Dekorfix · Shirokë" />
            </div>
            <h3 className="sr-only">{copy.location.distances}</h3>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
              {cities.map((city) => (
                <li key={city.name} className="flex items-baseline justify-between gap-3 border-b border-border py-2 text-small">
                  <span className="text-text">{city.name}</span>
                  <span className="tabular-nums text-text-tertiary">{city.km} km</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-caption text-text-tertiary">{copy.location.straightLine}</p>
          </div>
        </div>
      </section>

      {/* Common questions. */}
      <section aria-labelledby="faq-title" className="container-page py-section-sm">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <h2 id="faq-title" className="text-h2 text-text lg:col-span-4">
            {copy.faq.title}
          </h2>
          <div className="divide-y divide-border border-y border-border lg:col-span-8">
            {copy.faq.items.map((item) => (
              <details key={item.question} className="ct-faq group/faq">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-h4 text-text">
                  {item.question}
                  <span aria-hidden className="ct-faq-icon">
                    <ChevronDown className="size-4" strokeWidth={1.75} />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 text-body text-text-secondary">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
