import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

type PageKey = keyof Dictionary["pages"];
type NoticeKey = keyof Dictionary["placeholder"];

/**
 * Builds `generateMetadata` and the page component for a static placeholder
 * route. Each route file swaps this out for its real page in later phases.
 */
export function staticShell(key: PageKey, path: string, notice: NoticeKey = "page") {
  async function generateMetadata(): Promise<Metadata> {
    const t = await getDictionary();
    return pageMetadata({
      // The homepage uses the bare site name as its title.
      title: key === "home" ? undefined : t.pages[key].title,
      description: t.pages[key].description,
      path,
    });
  }

  async function Page() {
    const t = await getDictionary();
    return (
      <PageShell
        header={<PageHeader title={t.pages[key].title} description={t.pages[key].description} />}
        noticeLabel={t.placeholder.label}
        notice={t.placeholder[notice]}
      />
    );
  }

  return { generateMetadata, Page };
}
