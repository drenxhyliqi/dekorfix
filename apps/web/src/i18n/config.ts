export const locales = ["sq", "en"] as const;
export type Locale = (typeof locales)[number];

/** Albanian is the primary market language. */
export const defaultLocale: Locale = "sq";

export const localeNames: Record<Locale, string> = {
  sq: "Shqip",
  en: "English",
};

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Prefixes an app path with the locale: ("en", "/products") → "/en/products". */
export function localizePath(locale: Locale, path = "/"): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Swaps the locale segment of a pathname: ("/sq/products", "en") → "/en/products". */
export function switchLocalePath(pathname: string, locale: Locale): string {
  const [, first, ...rest] = pathname.split("/");
  const tail = first && hasLocale(first) ? rest : [first, ...rest].filter(Boolean);
  return `/${[locale, ...tail].join("/")}`.replace(/\/$/, "");
}
