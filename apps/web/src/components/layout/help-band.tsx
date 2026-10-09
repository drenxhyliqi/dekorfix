import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** Closing band for inner pages: "Planning a project?" with quote and contact links. */
export function HelpBand({ t, locale }: { t: Dictionary; locale: Locale }) {
  const cta = t.home.cta;
  return (
    <section aria-labelledby="help-title" className="border-t border-border">
      <div className="container-page flex flex-col gap-8 py-section-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2 id="help-title" className="text-h2 text-text">
            {cta.title}
          </h2>
          <p className="mt-4 text-lead text-text-secondary">{cta.text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink
            href={localizePath(locale, routes.contactForm())}
            variant="accent"
            size="lg"
            trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
          >
            {cta.primary}
          </ButtonLink>
          <ButtonLink href={localizePath(locale, routes.contact)} variant="secondary" size="lg">
            {cta.secondary}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
