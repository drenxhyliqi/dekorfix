"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { locales, switchLocalePath, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface LanguageProps {
  current: Locale;
  label: string;
  className?: string;
}

/**
 * "SQ / EN" links. With a pathname they keep the current page; without one
 * (while the pathname is not yet known) they point to each locale's home.
 */
export function LanguageLinks({ current, label, className, pathname }: LanguageProps & { pathname: string | null }) {
  return (
    <nav aria-label={label} className={cn("flex items-center text-small font-medium", className)}>
      {locales.map((locale, index) => (
        <span key={locale} className="flex items-center">
          {index > 0 && (
            <span aria-hidden className="px-1.5 text-border-strong">
              /
            </span>
          )}
          <Link
            href={pathname ? switchLocalePath(pathname, locale) : `/${locale}`}
            hrefLang={locale}
            lang={locale}
            aria-current={locale === current ? "true" : undefined}
            className={cn(
              "rounded-xs px-0.5 uppercase transition-colors duration-150",
              locale === current ? "text-text" : "text-text-tertiary hover:text-text",
            )}
          >
            {locale}
          </Link>
        </span>
      ))}
    </nav>
  );
}

function CurrentPathLanguageLinks(props: LanguageProps) {
  return <LanguageLinks {...props} pathname={usePathname()} />;
}

/** Self-contained switcher for places without a pathname (e.g. the footer). */
export function LanguageSwitcher(props: LanguageProps) {
  return (
    <Suspense fallback={<LanguageLinks {...props} pathname={null} />}>
      <CurrentPathLanguageLinks {...props} />
    </Suspense>
  );
}
