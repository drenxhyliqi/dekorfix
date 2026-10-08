import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { routes } from "@/config/routes";
import { getProducts } from "@/content/products";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

import { LAYER_COLORS, LayerWall } from "./layer-wall";
import { LayerWatcher } from "./layer-watcher";
import "./layer-system.css";

/** Products shown for each step (bottom layer first), and where the step links to. */
const STEPS = [
  {
    products: ["baza", "beton-kontakt"],
    path: routes.productCategory("bases"),
  },
  {
    products: ["cerafix", "sipofix", "styrofix"],
    path: routes.productCategory("adhesives"),
  },
  {
    products: ["confix", "gletex", "niveler"],
    path: routes.productCategory("plasters"),
  },
  { products: ["fasader", "fasadex", "premium"], path: routes.products },
] as const;

/**
 * Homepage "layer by layer" section. A drawn wall stays in view while the steps
 * scroll past: each step wipes its layer onto the wall, in a colour taken from
 * its products, and shows those products; the last step shows the finished wall.
 */
export function LayerSystem({ t, locale }: { t: Dictionary; locale: Locale }) {
  const copy = t.home.system;
  const steps = STEPS.map((step, index) => ({
    ...step,
    copy: copy.steps[index],
  })).filter(
    (
      step,
    ): step is (typeof STEPS)[number] & {
      copy: NonNullable<(typeof copy.steps)[number]>;
    } => Boolean(step.copy),
  );

  return (
    <section
      id="layers"
      aria-labelledby="system-title"
      className="bg-background py-section"
    >
      <LayerWatcher sectionId="layers" />
      <div className="container-page">
        <header className="max-w-3xl">
          <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
            <span aria-hidden className="brand-mark" />
            {copy.eyebrow}
          </p>
          <h2 id="system-title" className="mt-6 text-h1 text-balance text-text">
            {copy.title}
          </h2>
          <p className="mt-6 max-w-xl text-lead text-text-secondary">
            {copy.description}
          </p>
        </header>

        {/* Desktop: the wall is pinned while the steps scroll beside it. Narrow
            screens: the whole block is pinned and the steps swap in place, with
            the body's height giving each step its stretch of scroll. */}
        <div
          className="ls-body mt-12 lg:mt-16"
          style={{ "--ls-steps": steps.length + 1 } as CSSProperties}
        >
          <div className="ls-pin grid gap-x-12 lg:grid-cols-12">
            <div aria-hidden className="ls-visual lg:col-span-6">
              <div className="ls-wall-frame">
                <LayerWall />
              </div>
              <div className="ls-packs">
                {steps.map((step, index) => (
                  <div
                    key={step.path + index}
                    data-layer={index}
                    className="ls-pack-row"
                  >
                    {getProducts([...step.products]).map((product) => (
                      <div key={product.slug} className="ls-pack">
                        <Image
                          src={product.image}
                          alt=""
                          fill
                          sizes="8rem"
                          className="object-contain object-bottom"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <ol className="ls-steps lg:col-span-6">
              {steps.map((step, index) => {
                const names = getProducts([...step.products]).map(
                  (product) => product.name,
                );
                return (
                  <li
                    key={step.path + index}
                    data-step={index}
                    className="ls-step"
                  >
                    <span className="ls-step-index flex items-center gap-3 text-small tabular-nums">
                      <span
                        className="ls-swatch"
                        style={
                          { "--swatch": LAYER_COLORS[index] } as CSSProperties
                        }
                      />
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(steps.length).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 text-h2 text-text">
                      {step.copy.title}
                    </h3>
                    <p className="mt-4 max-w-md text-lead text-text-secondary">
                      {step.copy.text}
                    </p>
                    <p className="mt-6 text-small text-text-tertiary">
                      {names.join(" · ")}
                    </p>
                    <Link
                      href={localizePath(locale, step.path)}
                      className="group/link mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-text"
                    >
                      {copy.link}
                      <span className="sr-only">: {step.copy.title}</span>
                      <ArrowRight
                        aria-hidden
                        className="size-4 transition-transform duration-250 group-hover/link:translate-x-1"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </li>
                );
              })}
              <li data-step={steps.length} className="ls-step">
                <span className="ls-step-index flex items-center gap-3 text-small">
                  <span className="ls-swatch ls-swatch--all" />
                </span>
                <h3 className="mt-4 text-h2 text-text">
                  {copy.finished.title}
                </h3>
                <p className="mt-4 max-w-md text-lead text-text-secondary">
                  {copy.finished.text}
                </p>
                <p className="mt-6 max-w-md text-small text-text-tertiary">
                  {copy.finished.note}
                </p>
                <Link
                  href={localizePath(locale, routes.products)}
                  className="group/link mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-text"
                >
                  {t.home.range.action}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-250 group-hover/link:translate-x-1"
                    strokeWidth={1.75}
                  />
                </Link>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
