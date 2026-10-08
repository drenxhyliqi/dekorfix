import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type CSSProperties } from "react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { productCategories } from "@/config/navigation";
import { routes } from "@/config/routes";
import { getProduct, products, type ProductSummary } from "@/content/products";
import { LAYER_COLORS } from "@/features/home/layer-wall";
import { formatCoverage, formatPacks, LAYER_OF_CATEGORY, toTile } from "@/features/products/catalog-data";
import { ProductTile } from "@/features/products/product-tile";
import { WallFit } from "@/features/products/wall-fit";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

import "./product-detail.css";

type Props = PageProps<"/[lang]/products/[slug]">;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const product = getProduct(slug);
  if (!product) return {};
  return pageMetadata({ title: product.name, description: product.summary[locale], path: routes.product(slug) });
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense>
      <ProductDetail params={params} />
    </Suspense>
  );
}

/** Up to four others: the same category first, then the nearest layers of the wall. */
function relatedTo(product: ProductSummary): ProductSummary[] {
  const layer = LAYER_OF_CATEGORY[product.category];
  const distance = (other: ProductSummary) =>
    other.category === product.category ? 0 : 1 + Math.abs(LAYER_OF_CATEGORY[other.category] - layer);
  return products
    .filter((other) => other.slug !== product.slug)
    .map((other, index) => ({ other, index }))
    .sort((a, b) => distance(a.other) - distance(b.other) || a.index - b.index)
    .slice(0, 4)
    .map(({ other }) => other);
}

async function ProductDetail({ params }: Pick<Props, "params">) {
  const [{ slug }, locale, t] = await Promise.all([params, getLocale(), getDictionary()]);
  const product = getProduct(slug);
  if (!product) notFound();

  const href = (path: string) => localizePath(locale, path);
  const copy = t.productPage;
  const category = t.productCategories[product.category];
  const categoryPath = productCategories.find((entry) => entry.key === product.category)?.path ?? routes.products;
  const layer = LAYER_OF_CATEGORY[product.category];
  const steps = t.home.system.steps;
  const packs = formatPacks(product.slug);
  const coverage = formatCoverage(product.slug, locale);
  const related = relatedTo(product);
  const sameCategory = related.every((other) => other.category === product.category);

  return (
    <>
      <div className="container-page pb-section-sm pt-10 md:pt-14">
        <Breadcrumbs
          items={[
            { label: t.nav.home, href: href(routes.home) },
            { label: t.nav.products, href: href(routes.products) },
            { label: category.name, href: href(categoryPath) },
            { label: product.name },
          ]}
          label={t.a11y.breadcrumbs}
        />

        <div className="mt-8 grid gap-10 md:mt-12 lg:grid-cols-12 lg:gap-16">
          {/* The packshot stage: pinned on desktop while the details scroll beside it. */}
          <div className="lg:col-span-7">
            <div
              className="pd-stage lg:sticky lg:top-28"
              style={{ "--glow": LAYER_COLORS[layer] } as CSSProperties}
            >
              <span
                aria-hidden
                className="pd-watermark"
                style={{ "--chars": Math.max(product.name.length, 6) } as CSSProperties}
              >
                {product.name}
              </span>
              <div className="pd-pack">
                <Image
                  src={product.image}
                  alt={`${product.name}, ${category.name}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 90vw"
                  className="object-contain"
                />
              </div>
              <span aria-hidden className="pd-floor" />
            </div>
          </div>

          <div className="lg:col-span-5 lg:pt-4">
            <Link
              href={href(categoryPath)}
              className="flex items-center gap-2.5 text-label uppercase text-brand-text hover:underline"
            >
              <span aria-hidden className="brand-mark" />
              {category.name}
            </Link>
            <h1 className="mt-5 text-[clamp(3rem,1.5rem+5vw,6rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-text">
              {product.name}
            </h1>
            <p className="mt-6 text-lead text-text-secondary">{product.summary[locale]}</p>

            {(packs || coverage) && (
              <dl className="mt-10 grid grid-cols-2 border-y border-border" aria-label={copy.specs}>
                {packs && <Stat label={copy.packs} value={packs} />}
                {coverage && <Stat label={copy.coverage} value={coverage} />}
              </dl>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink
                href={href(routes.requestQuote)}
                variant="accent"
                size="lg"
                trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
              >
                {t.home.cta.primary}
              </ButtonLink>
              <ButtonLink href={href(routes.contact)} variant="secondary" size="lg">
                {t.home.cta.secondary}
              </ButtonLink>
            </div>

            {/* Where it goes: the wall from the homepage, painted up to this product's layer. */}
            <section aria-labelledby="fit-title" className="mt-14 border-t border-border pt-10">
              <WallFit layer={layer} steps={steps} label={copy.layer} title={copy.fitTitle} titleId="fit-title" />
            </section>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-border">
          <div className="container-page py-section-sm">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <h2 id="related-title" className="text-h2 text-text">
                {sameCategory ? copy.related.replace("{category}", category.name) : copy.relatedOther}
              </h2>
              <Link
                href={href(routes.products)}
                className="group/all inline-flex items-center gap-2 text-[0.9375rem] font-medium text-text"
              >
                {copy.all}
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-250 group-hover/all:translate-x-1"
                  strokeWidth={1.75}
                />
              </Link>
            </div>
            <ul className="pc-grid">
              {related.map((other) => (
                <li key={other.slug}>
                  <ProductTile item={toTile(other, t, locale)} viewLabel={t.home.featured.view} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

/** A published figure, set large: pack sizes, average coverage. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-6 pr-4 [&+&]:border-l [&+&]:border-border [&+&]:pl-6">
      <dt className="text-label uppercase text-text-tertiary">{label}</dt>
      <dd className="mt-3 text-h3 tabular-nums text-text">{value}</dd>
    </div>
  );
}
