import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { ButtonLink, type ButtonVariant } from "@/components/ui/button";
import { MediaFrame, type MediaImage } from "@/components/ui/media";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import { HeroVideo } from "./hero-video";

export interface HeroAction {
  label: string;
  href: string;
  variant?: ButtonVariant;
}

export type HeroMedia =
  | { kind: "image"; image: MediaImage }
  | { kind: "video"; src: string; poster?: string; label?: string }
  | { kind: "placeholder"; label?: string };

export interface HeroProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  media?: HeroMedia;
  /** `light` (default) or `dark` section. */
  tone?: "light" | "dark";
  /** `split`: text beside media. `stacked`: text above a wide media band. */
  layout?: "split" | "stacked";
  breadcrumbs?: BreadcrumbItem[];
  breadcrumbsLabel?: string;
  /** Use `display` for the homepage, `h1` elsewhere. */
  titleSize?: "display" | "h1";
}

/** Reusable page hero for Home, Products, Solutions, Projects, About, Resources and Project Studio. */
export function Hero({
  title,
  eyebrow,
  description,
  primaryAction,
  secondaryAction,
  media,
  tone = "light",
  layout = "split",
  breadcrumbs,
  breadcrumbsLabel,
  titleSize = "h1",
}: HeroProps) {
  const split = layout === "split" && media;

  const copy = (
    <div className={cn("flex flex-col", split ? "lg:col-span-6 lg:pr-8" : "lg:col-span-12")}>
      {eyebrow && <Eyebrow className="mb-6">{eyebrow}</Eyebrow>}
      <div className={cn(!split && "grid gap-8 lg:grid-cols-12 lg:items-end")}>
        <Heading as="h1" size={titleSize} className={cn(!split && "lg:col-span-8")}>
          {title}
        </Heading>
        {(description || primaryAction || secondaryAction) && (
          <div className={cn(split ? "mt-8" : "lg:col-span-4", "flex flex-col gap-8")}>
            {description && (
              <Text size="lead" className="max-w-xl">
                {description}
              </Text>
            )}
            <HeroActions primary={primaryAction} secondary={secondaryAction} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section data-tone={tone === "dark" ? "dark" : undefined} className="overflow-hidden">
      <div className="container-page pb-section-sm pt-10 md:pt-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} label={breadcrumbsLabel} className="mb-10 md:mb-16" />}
        {split ? (
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
            {copy}
            <div className="lg:col-span-6">
              <HeroMediaFrame media={media} ratio="4/5" />
            </div>
          </div>
        ) : (
          <>
            {copy}
            {media && (
              <div className="mt-12 md:mt-16">
                <HeroMediaFrame media={media} ratio="21/9" />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function HeroActions({ primary, secondary }: { primary?: HeroAction; secondary?: HeroAction }) {
  if (!primary && !secondary) return null;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {primary && (
        <ButtonLink
          href={primary.href}
          variant={primary.variant ?? "primary"}
          size="lg"
          trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
        >
          {primary.label}
        </ButtonLink>
      )}
      {secondary && (
        <ButtonLink href={secondary.href} variant={secondary.variant ?? "secondary"} size="lg">
          {secondary.label}
        </ButtonLink>
      )}
    </div>
  );
}

function HeroMediaFrame({ media, ratio }: { media: HeroMedia; ratio: "4/5" | "21/9" }) {
  // Wide bands become taller on small screens rather than a thin strip.
  const frameClass = ratio === "21/9" ? "aspect-[4/3] md:aspect-[21/9]" : undefined;
  if (media.kind === "image") {
    return (
      <MediaFrame
        ratio={ratio}
        image={media.image}
        priority
        sizes={ratio === "21/9" ? "100vw" : "(min-width: 1024px) 50vw, 100vw"}
        className={frameClass}
      />
    );
  }
  if (media.kind === "video") {
    return (
      <MediaFrame ratio={ratio} image={undefined} className={frameClass} placeholderLabel="">
        <HeroVideo src={media.src} poster={media.poster} label={media.label} />
      </MediaFrame>
    );
  }
  return <MediaFrame ratio={ratio} placeholderLabel={media.label ?? "Hero media pending"} className={frameClass} />;
}
