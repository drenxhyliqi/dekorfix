// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

/*
 * Horizontal scroll timeline: the section pins, the track slides sideways,
 * and each milestone draws its stem and dot and reveals its copy line by line
 * as it reaches the centre.
 *
 * Dekorfix changes: milestones, title and image come in as props (they
 * alternate between the top and bottom rows, in order; the layout is tuned for
 * up to seven), colours come from the design tokens (light tone, on white), the
 * pinned frame sits below the sticky site header, and scroll positions are
 * refreshed when content above the section changes height.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/* Inline stand-in for @gsap/react's useGSAP. Mirrors its default
   `revertOnUpdate: false`: one gsap.context lives for the component's
   lifetime, the callback is re-added when dependencies change, and the
   context is reverted only on unmount. A callback may return its own
   cleanup, which runs before the next re-add and on unmount. */
function useGSAP(
  callback: () => void | (() => void),
  options?: {
    dependencies?: unknown[];
    scope?: { current: Element | null } | Element | null;
  },
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    const el = scope && typeof scope === "object" && "current" in scope ? scope.current : (scope as Element | null);
    ctxRef.current = gsap.context(() => {}, el ?? undefined);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === "function" ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export type TimelineItem = {
  /** When it happened, e.g. "2018 · March". */
  heading: string;
  content: string;
};

type SplitTextInstance = InstanceType<typeof SplitText>;

export type TimelineProps = {
  title: string;
  periodLabel: string;
  /** In chronological order; they alternate top row, bottom row. */
  items: TimelineItem[];
  image: { src: string; alt: string };
  /** How long each milestone takes to draw in, relative to the scroll (1 ≈ 7% of it). */
  duration?: number;
  className?: string;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export default function Timeline({ title, periodLabel, items, image, duration = 1.2, className }: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const normalizedDuration = Math.max(0.2, duration);

  const milestones = items.map((item, index) => ({ ...item, id: `m${index}`, top: index % 2 === 0 }));
  const topRow = milestones.filter((item) => item.top);
  const bottomRow = milestones.filter((item) => !item.top);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const slider = wholeSliderRef.current;
      if (!section || !slider) return;

      /*
       * One scrubbed timeline over the whole pinned scroll. The track slides
       * just far enough to bring the end of the last milestone on screen, the
       * line grows over the same span (so it finishes exactly as the slide
       * does), and each milestone draws in as the line's tip reaches its stem.
       * Everything is measured from the layout, so it holds at any width.
       */
      let built: gsap.Context | undefined;
      const build = () => {
        built?.revert();
        built = gsap.context(() => {
          const line = section.querySelector<HTMLElement>(".journey-line");
          if (!line) return;
          const origin = slider.getBoundingClientRect().left;
          const frameWidth = slider.parentElement?.clientWidth ?? window.innerWidth;
          const lineStart = line.getBoundingClientRect().left - origin;
          const blocks = Array.from(section.querySelectorAll<HTMLElement>("[data-milestone]"));
          const contentEnd = Math.max(lineStart, ...blocks.map((block) => block.getBoundingClientRect().right - origin));
          const lineLength = Math.max(1, contentEnd - lineStart);
          const shift = Math.max(0, contentEnd + frameWidth * 0.05 - frameWidth);
          // Where along the line (0 → 1) each stem stands.
          const at = (id: string) => {
            const stem = section.querySelector(`.jl-${id}`);
            return stem ? (stem.getBoundingClientRect().left - origin - lineStart) / lineLength : 0;
          };

          const master = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: true },
          });
          master.fromTo(slider, { x: 0 }, { x: -shift, duration: 1 }, 0);

          if (reducedMotion) {
            gsap.set(line, { width: lineLength });
            return;
          }
          master.fromTo(line, { width: 0 }, { width: lineLength, duration: 1 }, 0);

          const span = 0.07 * normalizedDuration;
          const splits: SplitTextInstance[] = [];
          for (const item of milestones) {
            const title = new SplitText(`.title-${item.id}`, { type: "lines", mask: "lines" });
            const description = new SplitText(`.description-${item.id}`, { type: "lines", mask: "lines" });
            splits.push(title, description);
            const reveal = gsap
              .timeline()
              .fromTo(
                `.jl-${item.id}`,
                { scaleY: 0, transformOrigin: item.top ? "50% 100%" : "50% 0%" },
                { scaleY: 1, duration: span * 0.4 },
              )
              .fromTo(`.jd-${item.id}`, { scale: 0 }, { scale: 1, duration: span * 0.4 }, "<")
              .fromTo(
                title.lines,
                { yPercent: 100 },
                { yPercent: 0, duration: span * 0.6, stagger: span * 0.05, ease: "power2.out" },
                `<${span * 0.2}`,
              )
              .fromTo(
                description.lines,
                { yPercent: 100 },
                { yPercent: 0, duration: span * 0.6, stagger: span * 0.05, ease: "power2.out" },
                "<",
              );
            master.add(reveal, Math.max(0, at(item.id) - span * 0.1));
          }
          return () => splits.forEach((split) => split.revert());
        }, section);
      };
      build();

      // Rebuild when the width changes (heights change on phones as the URL bar moves).
      let width = window.innerWidth;
      let frame = 0;
      const onResize = () => {
        if (window.innerWidth === width) return;
        width = window.innerWidth;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          build();
          ScrollTrigger.refresh();
        });
      };
      window.addEventListener("resize", onResize);
      // Content above can settle its height after load; keep scroll positions in step.
      const observer = new ResizeObserver(() => ScrollTrigger.refresh());
      observer.observe(document.body);

      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", onResize);
        observer.disconnect();
        built?.revert();
      };
    },
    // `milestones` is derived from `items`.
    { dependencies: [normalizedDuration, reducedMotion, items], scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="timeline-title"
      className={cn("relative h-[200vw] w-full bg-background max-[600px]:h-[400vh]", className)}
    >
      {/* Pinned below the sticky header (4rem), with the track centred in the frame. */}
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] w-full flex-col justify-center overflow-hidden">
        <div
          ref={wholeSliderRef}
          className="mr-[2vw] flex h-[30vw] w-[240vw] items-center gap-[5vw] px-[5vw] max-[600px]:h-[80vh] max-[600px]:w-[800vw] max-[600px]:px-[7vw]"
        >
          <div className="relative h-full w-[30vw] shrink-0 overflow-hidden rounded-[1vw] max-[600px]:h-[65vw] max-[600px]:w-[85vw] max-[600px]:rounded-[5vw]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              draggable={false}
              sizes="(max-width: 600px) 85vw, 30vw"
              className="object-cover"
            />
          </div>

          <div className="relative h-full w-full">
            <div className="absolute left-0 top-[49%] flex h-fit w-full items-center">
              <div className="size-[.8vw] rounded-full bg-brand max-[600px]:size-[2vw]" />
              <div className="journey-line h-px w-0 rounded-full bg-brand" />
              <div className="size-[.8vw] rounded-full bg-brand max-[600px]:size-[2vw]" />
            </div>

            <div className="flex h-1/2 w-full items-center justify-start gap-[.5vw]">
              <div className="h-full w-[20%] pt-[2vw] max-[600px]:h-fit max-[600px]:pt-[5vw]">
                <h2 id="timeline-title" className="w-[65%] text-[3vw] leading-[0.95] text-text max-[600px]:text-[8.5vw]">
                  {title}
                </h2>
              </div>

              <div className="flex h-full w-full gap-x-[15vw] max-[600px]:gap-x-[40vw]">
                {topRow.map((item) => (
                  <div
                    key={item.id}
                    data-milestone={item.id}
                    className="relative h-full w-[30vw] px-[3vw] max-[600px]:flex max-[600px]:w-[70vw] max-[600px]:flex-col max-[600px]:px-[7vw]"
                  >
                    <div className="absolute inset-y-0 left-0 h-full w-full">
                      <div
                        className={`jd-${item.id} relative aspect-square size-[1vw] -translate-x-1/2 rounded-full bg-brand max-[600px]:size-[2.5vw]`}
                      />
                      <div className={`jl-${item.id} h-[94%] w-px origin-bottom rounded-full bg-brand`} />
                    </div>

                    <div className="-mt-[1vw] space-y-[1vw] max-[600px]:-mt-[2vw]">
                      <h3 className={`title-${item.id} text-[2.5vw] leading-none text-text max-[600px]:text-[6.4vw]`}>
                        {item.heading}
                      </h3>
                      <p
                        className={`description-${item.id} w-[90%] text-[1.5vw] leading-[1.15] text-text-secondary max-[600px]:text-[4.8vw]`}
                      >
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex h-1/2 w-full items-center justify-start">
              <div className="h-full w-[34%] pt-[2vw] max-[600px]:w-[30%] max-[600px]:pt-[5vw]">
                <p className="text-[1.65vw] leading-none text-text-secondary max-[600px]:text-[4.2vw]">
                  {periodLabel}
                </p>
              </div>

              <div className="ml-[7vw] flex h-full w-full gap-x-[20vw] max-[600px]:gap-x-[40vw]">
                {bottomRow.map((item) => (
                  <div
                    key={item.id}
                    data-milestone={item.id}
                    className="relative h-full w-[25vw] px-[3vw] max-[600px]:w-[70vw] max-[600px]:px-[7vw]"
                  >
                    <div className="absolute bottom-[-1%] left-0 h-full w-full">
                      <div
                        className={`jl-${item.id} h-[94%] w-px origin-top rounded-full bg-brand max-[600px]:h-full`}
                      />
                      <div
                        className={`jd-${item.id} relative aspect-square size-[1vw] -translate-x-1/2 rounded-full bg-brand max-[600px]:size-[2.5vw]`}
                      />
                    </div>

                    <div className="flex h-full w-full flex-col justify-end space-y-[1vw]">
                      <h3 className={`title-${item.id} text-[2.5vw] leading-none text-text max-[600px]:text-[6.4vw]`}>
                        {item.heading}
                      </h3>
                      <p
                        className={`description-${item.id} w-[90%] text-[1.5vw] leading-[1.15] text-text-secondary max-[600px]:text-[4.8vw]`}
                      >
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
