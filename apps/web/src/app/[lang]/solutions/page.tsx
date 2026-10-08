import type { Metadata } from "next";

import { HelpBand } from "@/components/layout/help-band";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { routes } from "@/config/routes";
import { getProducts } from "@/content/products";
import { solutions } from "@/content/solutions";
import { SolutionCard } from "@/features/solutions/solution-card";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

import "@/features/solutions/solutions.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ title: t.pages.solutions.title, description: t.pages.solutions.description, path: routes.solutions });
}

/** Solutions by task: each job, what it takes, and the Dekorfix products for it. */
export default async function SolutionsPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const copy = t.solutionsPage;
  const asks = copy.title.endsWith("?");

  return (
    <>
      <header className="container-page pb-12 pt-10 md:pb-16 md:pt-14">
        <Breadcrumbs
          items={[{ label: t.nav.home, href: href(routes.home) }, { label: t.nav.solutions }]}
          label={t.a11y.breadcrumbs}
        />
        <div className="mt-10 grid gap-8 md:mt-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
              <span aria-hidden className="brand-mark" />
              {copy.eyebrow}
            </p>
            <h1 className="sl-title mt-6 text-balance text-text">
              {asks ? copy.title.slice(0, -1) : copy.title}
              {asks && <span className="text-brand">?</span>}
            </h1>
          </div>
          <p className="text-lead text-text-secondary lg:col-span-4">{copy.description}</p>
        </div>
      </header>

      <div className="container-page pb-section">
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution, index) => {
            // The first and last span two columns, so seven cards fill three rows.
            const wide = index === 0 || index === solutions.length - 1;
            return (
              <li key={solution.key} className={cn(wide && "lg:col-span-2")}>
                <SolutionCard
                  index={index}
                  title={t.solutionCopy[solution.key].title}
                  text={t.solutionCopy[solution.key].text}
                  href={href(routes.solution(solution.slug))}
                  layer={solution.layer}
                  products={getProducts(solution.products)}
                  wide={wide}
                />
              </li>
            );
          })}
        </ul>
      </div>

      <HelpBand t={t} locale={locale} />
    </>
  );
}
