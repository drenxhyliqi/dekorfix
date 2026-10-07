import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

import { WallDiagram } from "./wall-diagram";

export function StudioTeaser({ t, locale }: { t: Dictionary; locale: Locale }) {
  const copy = t.home.studio;
  return (
    <Section tone="dark" aria-labelledby="studio-title">
      <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-5">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <Badge variant="brand">{t.megaMenu.comingSoon}</Badge>
          </div>
          <Heading id="studio-title" size="h2">
            {copy.title}
          </Heading>
          <Text size="lead" className="mt-6">
            {copy.text}
          </Text>
          <ol className="mt-10 border-t border-border">
            {copy.features.map((feature, index) => (
              <li key={feature} className="flex items-baseline gap-6 border-b border-border py-4">
                <span className="text-small tabular-nums text-text-tertiary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-body text-text">{feature}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href={localizePath(locale, routes.projectStudio)}
              variant="accent"
              size="lg"
              trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
            >
              {copy.primaryCta}
            </ButtonLink>
            <ButtonLink href={localizePath(locale, routes.calculator)} variant="secondary" size="lg">
              {copy.secondaryCta}
            </ButtonLink>
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-4 md:p-8 lg:col-span-7">
          <WallDiagram label={copy.diagramLabel} layers={copy.layers} />
        </div>
      </div>
    </Section>
  );
}
