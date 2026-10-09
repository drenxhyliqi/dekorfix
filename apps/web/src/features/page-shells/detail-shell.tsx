import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { localizePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { humanizeSlug, pageMetadata } from "@/lib/metadata";

export interface DetailKind {
  /** Dictionary page key for the single item, e.g. "product". */
  item: "product" | "project";
  /** Dictionary page/nav key of the parent listing. */
  listing: "products" | "projects";
  listingPath: string;
  itemPath: (slug: string) => string;
  notice: keyof Dictionary["placeholder"];
}

type SlugParams = Promise<{ slug: string }>;

/** Placeholder detail page: breadcrumbs and title derived from the URL slug. */
export function detailShell(kind: DetailKind) {
  async function generateMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
    const [{ slug }, t] = await Promise.all([params, getDictionary()]);
    return pageMetadata({
      title: humanizeSlug(slug),
      description: t.pages[kind.item].description,
      path: kind.itemPath(slug),
    });
  }

  async function Page({ params }: { params: SlugParams }) {
    const t = await getDictionary();
    const fallback = <PageHeader eyebrow={t.pages[kind.item].title} title={t.pages[kind.item].title} />;
    return (
      <PageShell
        header={
          <Suspense fallback={fallback}>
            <DetailHeader kind={kind} params={params} />
          </Suspense>
        }
        noticeLabel={t.placeholder.label}
        notice={t.placeholder[kind.notice]}
      />
    );
  }

  return { generateMetadata, Page };
}

async function DetailHeader({ kind, params }: { kind: DetailKind; params: SlugParams }) {
  const [{ slug }, t, locale] = await Promise.all([params, getDictionary(), getLocale()]);
  const title = humanizeSlug(slug);
  return (
    <PageHeader
      breadcrumbsLabel={t.a11y.breadcrumbs}
      breadcrumbs={[
        { label: t.nav.home, href: localizePath(locale) },
        { label: t.nav[kind.listing], href: localizePath(locale, kind.listingPath) },
        { label: title },
      ]}
      eyebrow={t.pages[kind.item].title}
      title={title}
    />
  );
}
