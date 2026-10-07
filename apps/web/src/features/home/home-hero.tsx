import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Text } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

import { HeroStage } from "./hero/hero-stage";

/*
 * Two-act headline driven by scroll progress (`--hero-p`, set by HeroStage).
 * Act 1 fades out from 18% to 43%; act 2 fades in from 42% to 67%.
 */
const actOne: CSSProperties = {
  opacity: "clamp(0, calc(1 - (var(--hero-p) - 0.18) * 4), 1)",
  transform: "translateY(calc(clamp(0, (var(--hero-p) - 0.18) * 4, 1) * -1.25rem))",
};
const actTwo: CSSProperties = {
  opacity: "clamp(0, calc((var(--hero-p) - 0.42) * 4), 1)",
  transform: "translateY(calc((1 - clamp(0, (var(--hero-p) - 0.42) * 4, 1)) * 1.25rem))",
};

export function HomeHero({ t, locale }: { t: Dictionary["home"]; locale: Locale }) {
  const hero = t.hero;
  return (
    <HeroStage poster={<HeroPoster />}>
      {/* Floor line the sack stands on; it continues into the next section. */}
      <span aria-hidden className="absolute inset-x-0 bottom-[6%] border-t border-border sm:bottom-[12%] lg:bottom-[10%]" />

      <div className="container-page relative flex h-full flex-col pb-6 pt-6 md:pt-8 lg:pb-10">
        <div className="flex items-start justify-between gap-6">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <ProgressRail />
        </div>

        <h1 id="hero-title" className="mt-6 grid text-hero text-text sm:mt-10 lg:mt-auto">
          <span style={actOne} className="[grid-area:1/1]">
            <span className="block">{hero.titleStart[0]}</span>
            <span className="block">{hero.titleStart[1]}</span>
          </span>{" "}
          <span style={actTwo} className="[grid-area:1/1]">
            <span className="block">{hero.titleEnd[0]}</span>
            <span className="block">{hero.titleEnd[1]}</span>
          </span>
        </h1>

        <div className="mt-6 flex items-end justify-between gap-10 lg:mt-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-12">
            <Text size="body" className="hidden max-w-sm lg:block">
              {hero.description}
            </Text>
            <div className="flex flex-wrap gap-3">
              <ButtonLink
                href={localizePath(locale, routes.products)}
                size="lg"
                className="max-sm:h-11 max-sm:px-5 max-sm:text-[0.9375rem]"
                trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
              >
                {hero.primaryCta}
              </ButtonLink>
              <ButtonLink
                href={localizePath(locale, routes.requestQuote)}
                variant="secondary"
                size="lg"
                className="max-sm:h-11 max-sm:px-5 max-sm:text-[0.9375rem]"
              >
                {hero.secondaryCta}
              </ButtonLink>
            </div>
          </div>
          <ScrollCue label={hero.scroll} />
        </div>
      </div>

      {/* Act 2: what is printed on the sack. Top right, clear of the product. */}
      <div
        style={actTwo}
        className="invisible absolute right-gutter top-[18%] z-20 hidden w-64 group-data-[act=2]/hero:visible lg:block xl:w-72"
      >
        <p className="text-h3 text-text">{hero.product}</p>
        <dl className="mt-6 border-t border-border-strong">
          {hero.facts.map((fact) => (
            <div key={fact.label} className="flex justify-between gap-6 border-b border-border py-3 text-small">
              <dt className="text-text-tertiary">{fact.label}</dt>
              <dd className="text-right text-text">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <Link
          href={localizePath(locale, routes.product("styrofiber"))}
          className="group/link mt-5 inline-flex items-center gap-2 text-small font-medium text-text"
        >
          {hero.productLink}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-250 group-hover/link:translate-x-1"
            strokeWidth={1.75}
          />
        </Link>
      </div>
      <p className="sr-only">{hero.sceneLabel}</p>
    </HeroStage>
  );
}

/** Static render of the sack, positioned like the WebGL scene (see hero-layout.ts). */
function HeroPoster() {
  return (
    <div className="absolute left-[52%] top-[69%] h-[50%] -translate-x-1/2 -translate-y-1/2 sm:left-[68%] sm:top-[56%] sm:h-[64%] lg:left-[66.5%] lg:top-1/2 lg:h-[80%]">
      <Image
        src="/images/3d/styrofiber-poster.webp"
        alt=""
        width={720}
        height={1080}
        priority
        sizes="(min-width: 1024px) 34vw, 60vw"
        className="h-full w-auto max-w-none"
      />
    </div>
  );
}

/** Thin vertical rail filled in brand red as the sequence plays. */
function ProgressRail() {
  return (
    <div aria-hidden className="hidden items-center gap-3 text-caption tabular-nums text-text-tertiary lg:flex">
      <span>01</span>
      <span className="relative h-px w-16 bg-border-strong">
        <span
          className="absolute inset-0 origin-left bg-brand"
          style={{ transform: "scaleX(var(--hero-p))" }}
        />
      </span>
      <span>02</span>
    </div>
  );
}

/** Quiet scroll invitation: a hairline with a travelling segment; fades once scrolling starts. */
function ScrollCue({ label }: { label: string }) {
  return (
    <div
      aria-hidden
      style={{ opacity: "clamp(0, calc(1 - var(--hero-p) * 8), 1)" }}
      className="hidden shrink-0 flex-col items-center gap-3 text-caption uppercase tracking-[0.12em] text-text-tertiary lg:flex"
    >
      <span className="[writing-mode:vertical-rl]">{label}</span>
      <span className="relative h-12 w-px overflow-hidden bg-border-strong">
        <span className="absolute inset-x-0 top-0 h-1/3 animate-[hero-cue_2.4s_var(--ease-in-out)_infinite] bg-text" />
      </span>
    </div>
  );
}

export function Credentials({ items }: { items: Dictionary["home"]["credentials"] }) {
  return (
    <div className="container-page">
      <ul className="grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <li
            key={item.code}
            className={cn(
              "flex flex-col gap-2 py-6 sm:px-6 lg:py-8",
              index > 0 && "border-t border-border sm:border-t-0",
              index % 2 === 1 && "sm:border-l",
              index >= 2 && "sm:border-t lg:border-t-0",
              index > 0 && "lg:border-l",
              index === 0 && "sm:pl-0",
              index === 2 && "sm:pl-0 lg:pl-6",
            )}
          >
            <span className="text-h4 tabular-nums text-text">{item.code}</span>
            <span className="text-small text-text-secondary">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
