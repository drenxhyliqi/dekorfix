import { ArrowRight, Phone } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Heading, Text } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { company } from "@/config/site";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function ClosingCta({ t, locale }: { t: Dictionary; locale: Locale }) {
  const copy = t.home.cta;
  return (
    <Section tone="muted" spacing="compact" aria-labelledby="cta-title">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="lg:col-span-7">
          <Heading id="cta-title" size="h2">
            {copy.title}
          </Heading>
          <Text size="lead" className="mt-6 max-w-xl">
            {copy.text}
          </Text>
        </div>
        <div className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9">
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <ButtonLink
              href={localizePath(locale, routes.requestQuote)}
              variant="accent"
              size="lg"
              trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
            >
              {copy.primary}
            </ButtonLink>
            <ButtonLink href={localizePath(locale, routes.contact)} variant="secondary" size="lg">
              {copy.secondary}
            </ButtonLink>
          </div>
          <div className="border-t border-border-strong pt-6">
            <p className="text-label uppercase text-text-tertiary">{copy.call}</p>
            <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
              {company.phones.map((phone) => (
                <li key={phone.href}>
                  <a
                    href={phone.href}
                    className="inline-flex items-center gap-2 text-h4 tabular-nums text-text transition-colors hover:text-text-secondary"
                  >
                    <Phone aria-hidden className="size-4" strokeWidth={1.5} />
                    {phone.display}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
