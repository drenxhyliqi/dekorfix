import type { Metadata } from "next";

import { routes } from "@/config/routes";
import { StudioTeaser } from "@/features/home/studio-teaser";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ description: t.pages.home.description, path: routes.home });
}

export default async function HomePage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  return <StudioTeaser t={t} locale={locale} />;
}
