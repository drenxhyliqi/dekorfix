import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { ButtonLink } from "@/components/ui/button";
import { products } from "@/content/products";
import type { Dictionary } from "@/i18n/dictionaries/en";

import "./product-hero.css";

type Depth = "near" | "mid" | "far";

/**
 * How each depth reads. Near packshots are only lightly blurred, large, shadowed
 * and in front, and roam the furthest; far ones are small, blurred, faded and
 * barely move. `drift` scales the bob and tilt, `wander` is the sideways roam in rem.
 */
const DEPTHS: Record<
  Depth,
  {
    blur: number;
    opacity: number;
    shadow: number;
    drift: number;
    wander: number;
    layer: number;
    minRem: number;
  }
> = {
  near: { blur: 2.5, opacity: 1, shadow: 0.22, drift: 1.6, wander: 2.75, layer: 3, minRem: 7 },
  mid: { blur: 4, opacity: 0.9, shadow: 0.1, drift: 1.1, wander: 1.75, layer: 2, minRem: 5 },
  far: { blur: 12, opacity: 0.6, shadow: 0, drift: 0.6, wander: 1, layer: 1, minRem: 4 },
};

/**
 * Where each packshot floats: centre in % of the hero, size in vw (clamped),
 * resting tilt, and seconds per float cycle (different for each, so they never
 * move in step). The same arrangement is used at every screen size.
 */
const FLOATERS: Array<{
  slug: string;
  depth: Depth;
  x: number;
  y: number;
  size: number;
  rotate: number;
  cycle: number;
}> = [
  { slug: "styrofiber", depth: "near", x: 8, y: 74, size: 22, rotate: -8, cycle: 12 },
  { slug: "premium", depth: "near", x: 91, y: 68, size: 24, rotate: 6, cycle: 14 },
  { slug: "gletex", depth: "mid", x: 88, y: 20, size: 14, rotate: 10, cycle: 10 },
  { slug: "fasadex", depth: "mid", x: 12, y: 22, size: 15, rotate: -6, cycle: 13 },
  { slug: "hidrofix", depth: "far", x: 34, y: 11, size: 8, rotate: -12, cycle: 9 },
  { slug: "baza", depth: "far", x: 66, y: 10, size: 10, rotate: 9, cycle: 11.5 },
  { slug: "cerafix", depth: "far", x: 64, y: 90, size: 9, rotate: 12, cycle: 9.5 },
  { slug: "beton-kontakt", depth: "far", x: 30, y: 88, size: 10, rotate: -5, cycle: 12.5 },
];

/** Highlighted in brand red wherever it appears in the solid headline lines. */
const BRAND = "Dekorfix";
/** Word reveal timing, in ms; keep in step with .hh-word in product-hero.css. */
const WORD_DELAY = 150;
const WORD_STAGGER = 70;

const productImage = new Map(products.map((product) => [product.slug, product.image]));

/**
 * Homepage hero on white: the headline and calls to action over Dekorfix
 * packshots that float slowly around them at three depths, from sharp and
 * close to blurred and far away. Each roams on its own slow path, the near
 * ones furthest, which deepens the sense of depth.
 */
export function ProductHero({
  copy,
  productsHref,
  quoteHref,
}: {
  copy: Dictionary["home"]["hero"];
  productsHref: string;
  quoteHref: string;
}) {
  // Two solid lines, then the closing sentence as a smaller outlined line.
  // Words are numbered across all lines for the staggered reveal.
  const lines = [
    { text: copy.titleStart[0] ?? "", outline: false },
    { text: copy.titleStart.slice(1).join(" "), outline: false },
    { text: copy.titleEnd.join(" "), outline: true },
  ];
  const lineWords = lines.map((line) => line.text.split(" ").filter(Boolean));
  const headline = lines.map((line, i) => {
    const before = lineWords.slice(0, i).flat().length;
    return { ...line, words: (lineWords[i] ?? []).map((word, w) => ({ word, order: before + w })) };
  });
  const afterHeadline = WORD_DELAY + lineWords.flat().length * WORD_STAGGER + 200;
  // "Maker · Place": the place is left out on phones so the label stays on one line.
  const [maker, place] = copy.label.split(" · ");

  return (
    <section aria-labelledby="hero-title" className="hh relative isolate overflow-hidden bg-background">
      <div aria-hidden className="hh-floaters">
        {FLOATERS.map((item, index) => {
          const src = productImage.get(item.slug);
          if (!src) return null;
          const depth = DEPTHS[item.depth];
          const style = {
            "--x": `${item.x}%`,
            "--y": `${item.y}%`,
            "--size": item.size,
            "--min": `${depth.minRem}rem`,
            "--blur": `${depth.blur}px`,
            "--opacity": depth.opacity,
            "--shadow": depth.shadow,
            "--drift": depth.drift,
            "--wander": `${depth.wander}rem`,
            "--rotate": `${item.rotate}deg`,
            "--cycle": `${item.cycle}s`,
            "--enter": `${index * 90}ms`,
            zIndex: depth.layer,
          } as CSSProperties;
          return (
            <div key={item.slug} className="hh-floater" style={style}>
              <Image src={src} alt="" width={480} height={680} sizes="24vw" className="hh-pack" />
            </div>
          );
        })}
      </div>

      <div className="container-page relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center py-16 text-center xl:min-h-[calc(100svh-4.5rem)]">
        <p
          className="hh-rise inline-flex items-center gap-2.5 text-label uppercase text-brand-text"
          style={{ "--rise": "0ms" } as CSSProperties}
        >
          <span aria-hidden className="brand-mark" />
          <span>
            {maker}
            {place && <span className="hidden sm:inline"> · {place}</span>}
          </span>
        </p>

        <h1 id="hero-title" className="hh-title mt-8 text-balance text-text md:mt-10">
          {headline.map((line, lineIndex) => (
            <span key={lineIndex} className={line.outline ? "hh-title-sub" : "block"}>
              {line.words.map(({ word, order }, wordIndex) => (
                <span key={wordIndex}>
                  {wordIndex > 0 && " "}
                  <span className="hh-word">
                    <span
                      className={word.includes(BRAND) && !line.outline ? "text-brand" : undefined}
                      style={{ "--i": order } as CSSProperties}
                    >
                      {word}
                    </span>
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p
          className="hh-rise mt-8 max-w-2xl text-lead text-text-secondary md:mt-10"
          style={{ "--rise": `${afterHeadline}ms` } as CSSProperties}
        >
          {copy.description}
        </p>
        <div
          className="hh-rise mt-10 flex flex-wrap justify-center gap-3"
          style={{ "--rise": `${afterHeadline + 120}ms` } as CSSProperties}
        >
          <ButtonLink
            href={productsHref}
            variant="accent"
            size="lg"
            trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
          >
            {copy.primaryCta}
          </ButtonLink>
          <ButtonLink href={quoteHref} variant="secondary" size="lg">
            {copy.secondaryCta}
          </ButtonLink>
        </div>
      </div>
      <noscript>
        <style>
          {".hh-rise,.hh-floater,.hh-word>span{animation:none!important}.hh-floater{opacity:var(--opacity)!important}"}
        </style>
      </noscript>
    </section>
  );
}
