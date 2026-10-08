import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type CSSProperties } from "react";

import { HelpBand } from "@/components/layout/help-band";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { routes } from "@/config/routes";
import { getProducts } from "@/content/products";
import { getSolution, solutions } from "@/content/solutions";
import { LAYER_COLORS } from "@/features/home/layer-wall";
import { toTile } from "@/features/products/catalog-data";
import { ProductTile } from "@/features/products/product-tile";
import { WallFit } from "@/features/products/wall-fit";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

import "@/features/solutions/solutions.css";
import "./solution-detail.css";

type Props = PageProps<"/[lang]/solutions/[slug]">;

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, t] = await Promise.all([params, getDictionary()]);
  const solution = getSolution(slug);
  if (!solution) return {};
  const copy = t.solutionCopy[solution.key];
  return pageMetadata({ title: copy.title, description: copy.text, path: routes.solution(slug) });
}

export default function SolutionPage({ params }: Props) {
  return (
    <Suspense>
      <SolutionDetail params={params} />
    </Suspense>
  );
}

async function SolutionDetail({ params }: Pick<Props, "params">) {
  const [{ slug }, locale, t] = await Promise.all([params, getLocale(), getDictionary()]);
  const solution = getSolution(slug);
  if (!solution) notFound();

  const href = (path: string) => localizePath(locale, path);
  const copy = t.solutionCopy[solution.key];
  const page = t.solutionsPage;
  const items = getProducts(solution.products);
  const steps = t.home.system.steps;
  const others = solutions.filter((other) => other.slug !== solution.slug);

  return (
    <>
      <div className="container-page pb-section-sm pt-10 md:pt-14">
        <Breadcrumbs
          items={[
            { label: t.nav.home, href: href(routes.home) },
            { label: t.nav.solutions, href: href(routes.solutions) },
            { label: copy.title },
          ]}
          label={t.a11y.breadcrumbs}
        />

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
              <span aria-hidden className="brand-mark" />
              {page.eyebrow}
            </p>
            <h1 className="sl-title mt-6 text-balance text-text">{copy.title}</h1>
            <p className="mt-6 max-w-lg text-lead text-text-secondary">{copy.text}</p>
          </div>

          {/* The job's products together on one stage, in the colour of its layer. */}
          <div
            aria-hidden
            className="sd-stage lg:col-span-6"
            style={{ "--glow": LAYER_COLORS[solution.layer], "--count": items.length } as CSSProperties}
          >
            {items.map((product, index) => (
              <span key={product.slug} className="sd-pack" style={{ "--n": index } as CSSProperties}>
                <Image src={product.image} alt="" fill priority sizes="(min-width: 1024px) 22vw, 45vw" className="object-contain object-bottom" />
              </span>
            ))}
            <span className="sd-floor" />
          </div>
        </div>
      </div>

      <section aria-labelledby="products-title" className="border-t border-border">
        <div className="container-page py-section-sm">
          <h2 id="products-title" className="mb-10 text-h2 text-text">
            {page.productsTitle}
          </h2>
          <ul className="pc-grid">
            {items.map((product) => (
              <li key={product.slug}>
                <ProductTile item={toTile(product, t, locale)} viewLabel={t.home.featured.view} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="fit-title" className="border-t border-border">
        <div className="container-page grid gap-10 py-section-sm lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <WallFit
              layer={solution.layer}
              steps={steps}
              label={t.productPage.layer}
              title={t.productPage.fitTitle}
              titleId="fit-title"
            />
          </div>

          <div className="lg:col-span-5">
            <h2 className="text-h3 text-text">{page.otherTitle}</h2>
            <ul className="mt-6 border-t border-border">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link href={href(routes.solution(other.slug))} className="sd-other group/other">
                    <span
                      aria-hidden
                      className="sd-other-bar"
                      style={{ "--layer": LAYER_COLORS[other.layer] } as CSSProperties}
                    />
                    <span className="flex-1 text-body font-medium text-text transition-colors group-hover/other:text-brand">
                      {t.solutionCopy[other.key].title}
                    </span>
                    <ArrowRight
                      aria-hidden
                      className="size-4 text-text-tertiary transition-[color,translate] duration-250 group-hover/other:translate-x-1 group-hover/other:text-brand"
                      strokeWidth={1.75}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <HelpBand t={t} locale={locale} />
    </>
  );
}
