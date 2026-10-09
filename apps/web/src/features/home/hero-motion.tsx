"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's moving parts that need the browser: pauses the floating
 * packshots while the hero is off screen (no work for animations nobody sees),
 * fades the scroll cue once the visitor scrolls, and scrolls past the hero
 * when the cue is pressed.
 */
export function HeroMotion({ scrollLabel }: { scrollLabel: string }) {
  const cueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const hero = cueRef.current?.closest<HTMLElement>(".hh");
    if (!hero) return;
    const seen = new IntersectionObserver(([entry]) => {
      hero.toggleAttribute("data-paused", !entry?.isIntersecting);
    });
    seen.observe(hero);
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => hero.toggleAttribute("data-scrolled", window.scrollY > 40));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      seen.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      ref={cueRef}
      type="button"
      onClick={() => {
        // To the hero's bottom edge, less the sticky header that covers the top of the page.
        const hero = cueRef.current?.closest(".hh");
        if (!hero) return;
        const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
        window.scrollTo({ top: hero.getBoundingClientRect().bottom + window.scrollY - header, behavior: "smooth" });
      }}
      className="hh-scroll"
    >
      <span className="hh-scroll-label">{scrollLabel}</span>
      <span aria-hidden className="hh-track">
        <span className="hh-track-fill" />
      </span>
    </button>
  );
}
