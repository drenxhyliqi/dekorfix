import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/config/routes";
import { company } from "@/config/site";
import { products } from "@/content/products";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

import "./closing-cta.css";

/** Seal geometry, in SVG units: the circle the lettering runs around. */
const SEAL_RADIUS = 84;
const SEAL_CIRCUMFERENCE = 2 * Math.PI * SEAL_RADIUS;

/**
 * Homepage closing call to action: a marquee of Dekorfix product names, the
 * question set large with a rotating "request a quote" seal beside it, and the
 * direct ways to get in touch underneath.
 */
export function ClosingCta({ t, locale }: { t: Dictionary; locale: Locale }) {
  const copy = t.home.cta;
  const quoteHref = localizePath(locale, routes.contactForm("project"));
  // The question mark in brand red.
  const question = copy.title.endsWith("?") ? copy.title.slice(0, -1) : copy.title;
  const asks = copy.title.endsWith("?");
  // Repeated three times around the ring, spaced to fill it exactly. The
  // non-breaking space survives at the end of the text, where the ring joins.
  const sealText = `${copy.primary} ·\u00A0`.repeat(3).toUpperCase();

  return (
    <section aria-labelledby="cta-title" className="overflow-hidden bg-background pb-section">
      <Marquee names={products.map((product) => product.name)} />

      <div className="container-page mt-section-sm">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
              <span aria-hidden className="brand-mark" />
              {t.header.getInTouch}
            </p>
            <h2 id="cta-title" className="cc-title mt-6 text-balance text-text">
              {question}
              {asks && <span className="text-brand">?</span>}
            </h2>
            <p className="mt-8 max-w-xl text-lead text-text-secondary">{copy.text}</p>
            <Link
              href={localizePath(locale, routes.contact)}
              className="group/contact mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-text"
            >
              {copy.secondary}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-250 group-hover/contact:translate-x-1"
                strokeWidth={1.75}
              />
            </Link>
          </div>

          <div className="flex justify-center lg:col-span-4 lg:justify-end">
            <Link href={quoteHref} aria-label={copy.primary} className="cc-seal group/seal">
              <svg aria-hidden viewBox="0 0 200 200" className="cc-seal-ring">
                <defs>
                  <path
                    id="cc-seal-path"
                    d={`M 100 100 m -${SEAL_RADIUS} 0 a ${SEAL_RADIUS} ${SEAL_RADIUS} 0 1 1 ${SEAL_RADIUS * 2} 0 a ${SEAL_RADIUS} ${SEAL_RADIUS} 0 1 1 -${SEAL_RADIUS * 2} 0`}
                  />
                </defs>
                <text className="cc-seal-text">
                  <textPath href="#cc-seal-path" textLength={SEAL_CIRCUMFERENCE} lengthAdjust="spacing">
                    {sealText}
                  </textPath>
                </text>
              </svg>
              <span aria-hidden className="cc-seal-core">
                <ArrowUpRight className="cc-seal-arrow size-9" strokeWidth={1.5} />
              </span>
            </Link>
          </div>
        </div>

        <ul className="mt-section-sm grid border-t border-border md:grid-cols-3">
          <ContactTile icon={Phone} label={copy.call} href={company.phones[0].href}>
            <span className="tabular-nums">{company.phones[0].display}</span>
          </ContactTile>
          <ContactTile icon={Mail} label={t.header.email} href={`mailto:${company.email}`}>
            {company.email}
          </ContactTile>
          <ContactTile icon={MapPin} label={t.header.visit} href={company.mapsHref} newTabLabel={t.a11y.newTab}>
            {t.address.city}, {t.address.country}
          </ContactTile>
        </ul>
      </div>
    </section>
  );
}

/** Product names drifting past in a full-width band. Decorative: the names are listed elsewhere. */
function Marquee({ names }: { names: string[] }) {
  const run = (copy: number) => (
    <div className="cc-marquee-run" key={copy}>
      {names.map((name, index) => (
        <span key={name} className="cc-marquee-item">
          <span className={index % 2 === 0 ? "text-text" : "text-text-tertiary"}>{name}</span>
          <span className="cc-marquee-mark" />
        </span>
      ))}
    </div>
  );
  return (
    <div aria-hidden className="cc-marquee">
      {/* Two identical runs: the track moves by exactly one run, then repeats. */}
      <div className="cc-marquee-track">{[run(0), run(1)]}</div>
    </div>
  );
}

function ContactTile({
  icon: Icon,
  label,
  href,
  newTabLabel,
  children,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  /** Set for links that open in a new tab. */
  newTabLabel?: string;
  children: ReactNode;
}) {
  return (
    <li className="border-b border-border md:border-b-0 md:px-8 md:first:pl-0 md:[&:not(:first-child)]:border-l">
      <a
        href={href}
        {...(newTabLabel ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group/tile flex items-center gap-5 py-7"
      >
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-sm bg-surface-muted text-brand transition-colors duration-250 group-hover/tile:bg-brand group-hover/tile:text-white">
          <Icon aria-hidden className="size-5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block text-label uppercase text-text-tertiary">{label}</span>
          <span className="mt-1.5 block text-h4 text-text [overflow-wrap:anywhere]">{children}</span>
        </span>
        {newTabLabel && <span className="sr-only"> ({newTabLabel})</span>}
      </a>
    </li>
  );
}
