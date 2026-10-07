import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Section, SectionHeader } from "@/components/ui/section";
import { routes } from "@/config/routes";
import { getProducts } from "@/content/products";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** Products shown for each step, and where the step links to. */
const STEPS = [
  { products: ["baza", "beton-kontakt"], path: routes.productCategory("bases") },
  { products: ["cerafix", "sipofix", "styrofix"], path: routes.productCategory("adhesives") },
  { products: ["confix", "gletex", "niveler"], path: routes.productCategory("plasters") },
  { products: ["fasader", "fasadex", "premium"], path: routes.products },
] as const;

export function LayerSystem({ t, locale }: { t: Dictionary; locale: Locale }) {
  const copy = t.home.system;
  return (
    <Section tone="muted" aria-labelledby="system-title">
      <SectionHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        titleId="system-title"
        description={copy.description}
      />
      <ol className="grid gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step, index) => {
          const text = copy.steps[index];
          if (!text) return null;
          const products = getProducts([...step.products]);
          return (
            <li key={step.path + index} className="group relative flex flex-col border-t border-border-strong pt-6">
              {/* Fills in on hover: the step "builds up" the wall. */}
              <span
                aria-hidden
                className="absolute -top-px left-0 h-0.5 w-0 bg-brand transition-[width] duration-350 ease-out group-hover:w-full"
              />
              <span className="text-small tabular-nums text-text-tertiary">{String(index + 1).padStart(2, "0")}</span>

              {/* Fixed slots keep wide buckets and tall bags aligned across steps. */}
              <div className="mt-8 grid h-32 grid-cols-3 items-end gap-2" aria-hidden>
                {products.map((product) => (
                  <div key={product.slug} className="relative h-full">
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 8vw, 25vw"
                      className="object-contain object-bottom"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-small text-text-tertiary">{products.map((p) => p.name).join(" · ")}</p>

              <h3 className="mt-8 text-h3 text-text">{text.title}</h3>
              <p className="mt-3 text-body text-text-secondary">{text.text}</p>

              <Link
                href={localizePath(locale, step.path)}
                className="mt-auto inline-flex items-center gap-2 pt-6 text-small font-medium text-text after:absolute after:inset-0"
              >
                {copy.link}
                <span className="sr-only">: {text.title}</span>
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-250 group-hover:translate-x-1"
                  strokeWidth={1.75}
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
