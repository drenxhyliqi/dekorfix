import { ArrowUpRight, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { legalNav } from "@/config/navigation";
import { routes } from "@/config/routes";
import { company } from "@/config/site";
import { LEGAL_UPDATED, legalDocs, type LegalBlock, type LegalKey } from "@/content/legal";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

import "./legal.css";

const PATHS: Record<LegalKey, string> = {
  privacy: routes.privacy,
  terms: routes.terms,
  cookies: routes.cookies,
};

function Block({ block }: { block: LegalBlock }) {
  if ("p" in block) return <p>{block.p}</p>;
  if ("list" in block) {
    return (
      <ul className="lp-list">
        {block.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  const { head, rows } = block.table;
  return (
    <div>
      <table className="lp-table">
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                // On phones each row becomes a card; the column name rides along as a label.
                <td key={index} data-label={head[index]}>
                  {index === 0 ? <code>{cell}</code> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Builds `generateMetadata` and the page for one legal document. The three
 * pages share the layout: header, switcher, contents and numbered sections.
 */
export function legalPage(key: LegalKey) {
  async function generateMetadata(): Promise<Metadata> {
    const t = await getDictionary();
    return pageMetadata({ title: t.pages[key].title, description: t.pages[key].description, path: PATHS[key] });
  }

  async function Page() {
    const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
    const href = (path: string) => localizePath(locale, path);
    const doc = legalDocs[locale][key];
    const copy = t.legalPage;

    return (
      <>
        <header className="container-page pb-10 pt-10 md:pb-14 md:pt-14">
          <Breadcrumbs
            items={[{ label: t.nav.home, href: href(routes.home) }, { label: t.legal[key] }]}
            label={t.a11y.breadcrumbs}
          />
          <div className="mt-10 grid gap-8 md:mt-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
                <span aria-hidden className="brand-mark" />
                {copy.eyebrow}
              </p>
              <h1 className="mt-6 text-[clamp(2.75rem,1rem+5.5vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-balance text-text">
                {doc.title}
              </h1>
            </div>
            <div className="lg:col-span-4">
              <p className="text-lead text-text-secondary">{doc.intro}</p>
              <p className="mt-4 text-small text-text-tertiary">
                {copy.updated} <time className="font-medium text-text">{LEGAL_UPDATED[locale]}</time>
              </p>
            </div>
          </div>

          <nav aria-label={t.a11y.legalNavigation} className="lp-switch mt-10 md:mt-14">
            {legalNav.map((item) => {
              const current = item.key === key;
              return (
                <Link
                  key={item.key}
                  href={href(item.path)}
                  aria-current={current ? "page" : undefined}
                  className={cn("lp-switch-link", current && "lp-switch-link--current")}
                >
                  {t.legal[item.key]}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="container-page pb-section">
          <div className="grid gap-10 border-t border-border pt-10 md:pt-14 lg:grid-cols-12 lg:gap-16">
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="lp-aside">
                <nav aria-label={copy.contents}>
                  <p className="text-label uppercase text-text-tertiary">{copy.contents}</p>
                  <ol className="lp-toc mt-4">
                    {doc.sections.map((section, index) => (
                      <li key={section.id}>
                        <a href={`#${section.id}`} className="lp-toc-link">
                          <span className="lp-toc-num">{String(index + 1).padStart(2, "0")}</span>
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
                <p className="lp-draft mt-8" role="note">
                  <span className="lp-draft-label">{copy.draftLabel}</span>
                  {copy.draft}
                </p>
              </div>
            </aside>

            <article className="lg:col-span-8 xl:col-span-8 xl:col-start-5">
              {doc.sections.map((section, index) => (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="lp-section">
                  <span aria-hidden className="lp-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 id={`${section.id}-title`} className="text-h3 text-text">
                      {section.title}
                    </h2>
                    <div className="lp-prose mt-4">
                      {section.blocks.map((block, blockIndex) => (
                        <Block key={blockIndex} block={block} />
                      ))}
                    </div>
                  </div>
                </section>
              ))}

              <div className="lp-contact">
                <div>
                  <p className="text-h4 text-text">{copy.questions}</p>
                  <p className="mt-1 text-small text-text-secondary">{copy.questionsText}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href={`mailto:${company.email}`} className="lp-contact-link">
                    <Mail aria-hidden className="size-4" strokeWidth={1.75} />
                    {company.email}
                  </a>
                  <a href={company.phones[0].href} className="lp-contact-link">
                    <Phone aria-hidden className="size-4" strokeWidth={1.75} />
                    {company.phones[0].display}
                  </a>
                  <Link href={href(routes.contact)} className="lp-contact-link">
                    {t.nav.contact}
                    <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </>
    );
  }

  return { generateMetadata, Page };
}
