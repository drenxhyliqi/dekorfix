import { notFound } from "next/navigation";
import { lang } from "next/root-params";

import { hasLocale, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  sq: () => import("./dictionaries/sq").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
};

/**
 * Current locale from the `[lang]` root segment. 404s for unknown locales.
 * Undefined outside the public site (e.g. under the /admin root layout).
 */
export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!locale || !hasLocale(locale)) notFound();
  return locale;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}

export type { Dictionary };
