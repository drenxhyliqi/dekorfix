import { ArrowRight, BadgeCheck, MapPin, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { products } from "@/content/products";
import type { Dictionary } from "@/i18n/dictionaries/en";

import { HeroMotion } from "./hero-motion";
import "./product-hero.css";

type Depth = "near" | "mid" | "far";

/**
 * How each depth moves and stacks. The blur and shadow of each depth are baked
 * into its image (public/images/hero/*-{depth}.webp), so the browser only moves
 * pictures and never redraws a filter: that is what keeps the hero smooth.
 * `drift` scales the bob and tilt, `wander` is the sideways roam in rem, `grow`
 * makes up for the transparent margin the baked blur and shadow need.
 */
const DEPTHS: Record<Depth, { opacity: number; drift: number; wander: number; layer: number; minRem: number; grow: number }> = {
  near: { opacity: 1, drift: 1.6, wander: 2.75, layer: 3, minRem: 7, grow: 1.4 },
  mid: { opacity: 0.9, drift: 1.1, wander: 1.75, layer: 2, minRem: 5, grow: 1.628 },
  far: { opacity: 0.6, drift: 0.6, wander: 1, layer: 1, minRem: 4, grow: 1.555 },
};

/**
 * Where each packshot floats: centre in % of the hero, size in vw (clamped),
 * resting tilt, and seconds per float cycle (different for each, so they never
 * move in step). `ratio` is the baked image's height / width.
 */
const FLOATERS: Array<{ slug: string; depth: Depth; x: number; y: number; size: number; rotate: number; cycle: number; ratio: number }> = [
  { slug: "styrofiber", depth: "near", x: 8, y: 74, size: 22, rotate: -8, cycle: 12, ratio: 958 / 728 },
  { slug: "premium", depth: "near", x: 91, y: 68, size: 24, rotate: 6, cycle: 14, ratio: 548 / 728 },
  { slug: "gletex", depth: "mid", x: 88, y: 20, size: 14, rotate: 10, cycle: 10, ratio: 773 / 586 },
  { slug: "fasadex", depth: "mid", x: 12, y: 22, size: 15, rotate: -6, cycle: 13, ratio: 455 / 586 },
  { slug: "hidrofix", depth: "far", x: 34, y: 11, size: 8, rotate: -12, cycle: 9, ratio: 439 / 342 },
  { slug: "baza", depth: "far", x: 66, y: 10, size: 10, rotate: 9, cycle: 11.5, ratio: 267 / 342 },
  { slug: "cerafix", depth: "far", x: 64, y: 90, size: 9, rotate: 12, cycle: 9.5, ratio: 439 / 342 },
  { slug: "beton-kontakt", depth: "far", x: 30, y: 88, size: 10, rotate: -5, cycle: 12.5, ratio: 267 / 342 },
];

/** Highlighted in brand red wherever it appears in the headline. */
const BRAND = "Dekorfix";
/** Word reveal timing, in ms; keep in step with .hh-word in product-hero.css. */
const WORD_DELAY = 150;
const WORD_STAGGER = 70;

/**
 * Homepage hero on white: the headline and calls to action over Dekorfix
 * packshots floating at three depths, from sharp and close to blurred and far.
 * A scroll cue sits at the bottom; HeroMotion pauses the floating while the
 * hero is off screen and fades the cue once the visitor scrolls.
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
  // Two bold lines, then the closing sentence, lighter, with its last word underlined in brand red.
  const lines = [copy.titleStart[0] ?? "", copy.titleStart.slice(1).join(" "), copy.titleEnd.join(" ")];
  const lineWords = lines.map((line) => line.split(" ").filter(Boolean));
  const totalWords = lineWords.flat().length;
  const afterHeadline = WORD_DELAY + totalWords * WORD_STAGGER + 200;
  const [maker, place] = copy.label.split(" · ");
  const trust = [
    { icon: BadgeCheck, text: copy.trust.iso },
    { icon: MapPin, text: copy.trust.made },
    { icon: Package, text: copy.trust.products.replace("{n}", String(products.length)) },
  ];

  return (
    <section id="hero" aria-labelledby="hero-title" className="hh relative isolate overflow-hidden bg-background">
      <div aria-hidden className="hh-floaters">
        {FLOATERS.map((item, index) => {
          const depth = DEPTHS[item.depth];
          const style = {
            "--x": `${item.x}%`,
            "--y": `${item.y}%`,
            "--w": `clamp(${depth.minRem * depth.grow}rem, ${item.size * depth.grow}vw, ${22 * depth.grow}rem)`,
            "--opacity": depth.opacity,
            "--drift": depth.drift,
            "--wander": `${depth.wander}rem`,
            "--rotate": `${item.rotate}deg`,
            "--cycle": `${item.cycle}s`,
            "--enter": `${index * 90}ms`,
            zIndex: depth.layer,
          } as CSSProperties;
          return (
            <div key={item.slug} className="hh-floater" style={style}>
              <Image
                src={`/images/hero/${item.slug}-${item.depth}.webp`}
                alt=""
                width={400}
                height={Math.round(400 * item.ratio)}
                sizes={`${Math.round(item.size * depth.grow)}vw`}
                priority={item.depth === "near"}
                className="hh-pack"
              />
            </div>
          );
        })}
      </div>

      <div className="container-page relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center pb-28 pt-16 text-center xl:min-h-[calc(100svh-4.5rem)]">
        <p className="hh-rise hh-badge" style={{ "--rise": "0ms" } as CSSProperties}>
          <span aria-hidden className="hh-badge-dot" />
          <span>
            {maker}
            {place && <span className="hidden sm:inline text-text-tertiary"> · {place}</span>}
          </span>
        </p>

        <h1 id="hero-title" className="hh-title mt-8 text-balance text-text md:mt-10">
          {lineWords.map((words, lineIndex) => {
            const before = lineWords.slice(0, lineIndex).flat().length;
            const sub = lineIndex === lineWords.length - 1;
            return (
              <span key={lineIndex} className={sub ? "hh-title-sub" : "block"}>
                {words.map((word, wordIndex) => {
                  const order = before + wordIndex;
                  const last = sub && wordIndex === words.length - 1;
                  return (
                    <span key={wordIndex}>
                      {wordIndex > 0 && " "}
                      <span className="hh-word">
                        <span
                          className={word.includes(BRAND) && !sub ? "text-brand" : last ? "hh-mark" : undefined}
                          style={{ "--i": order, "--mark": `${WORD_DELAY + totalWords * WORD_STAGGER + 350}ms` } as CSSProperties}
                        >
                          {word}
                        </span>
                      </span>
                    </span>
                  );
                })}
              </span>
            );
          })}
        </h1>

        <p
          className="hh-rise mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-text-secondary md:mt-9 md:text-lead"
          style={{ "--rise": `${afterHeadline}ms` } as CSSProperties}
        >
          {copy.description}
        </p>

        <div
          className="hh-rise mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
          style={{ "--rise": `${afterHeadline + 120}ms` } as CSSProperties}
        >
          <Link href={productsHref} className="hh-btn hh-btn--primary">
            <span>{copy.primaryCta}</span>
            <span aria-hidden className="hh-btn-icon">
              <ArrowRight className="hh-arrow size-4" strokeWidth={2} />
              <ArrowRight className="hh-arrow hh-arrow--next size-4" strokeWidth={2} />
            </span>
          </Link>
          <Link href={quoteHref} className="hh-btn hh-btn--ghost">
            {copy.secondaryCta}
          </Link>
        </div>

        <ul
          className="hh-rise mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-small text-text-secondary"
          style={{ "--rise": `${afterHeadline + 260}ms` } as CSSProperties}
        >
          {trust.map(({ icon: Icon, text }) => (
            <li key={text} className="inline-flex items-center gap-2">
              <Icon aria-hidden className="size-4 text-brand" strokeWidth={1.75} />
              {text}
            </li>
          ))}
        </ul>
      </div>

      <HeroMotion scrollLabel={copy.scroll} />

      <noscript>
        <style>
          {".hh-rise,.hh-floater,.hh-word>span{animation:none!important}.hh-floater{opacity:var(--opacity)!important}"}
        </style>
      </noscript>
    </section>
  );
}
