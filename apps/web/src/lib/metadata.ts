import type { Metadata } from "next";

import { defaultLocale, localizePath, locales, type Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/get-dictionary";

const SITE_NAME = "Dekorfix";

const ogLocales: Record<Locale, string> = { sq: "sq_AL", en: "en_US" };

/**
 * Standard metadata for a public page: title, description, canonical URL,
 * hreflang alternates and Open Graph. `path` is locale-independent.
 * Relative URLs resolve against `metadataBase` (SITE_URL) set in the root layout.
 */
export async function pageMetadata({
  title,
  description,
  path,
}: {
  /** Omit on the homepage to use the site name alone. */
  title?: string;
  description: string;
  path: string;
}): Promise<Metadata> {
  const locale = await getLocale();
  const url = localizePath(locale, path);
  const languages = Object.fromEntries([
    ...locales.map((l) => [l, localizePath(l, path)]),
    ["x-default", localizePath(defaultLocale, path)],
  ]);

  return {
    title: title ?? { absolute: SITE_NAME },
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: title ? `${title} · ${SITE_NAME}` : SITE_NAME,
      description,
      url,
      locale: ogLocales[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocales[l]),
    },
  };
}

/** "some-product-name" → "Some product name" (until real titles come from the API). */
export function humanizeSlug(slug: string): string {
  const text = decodeURIComponent(slug).replace(/[-_]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
