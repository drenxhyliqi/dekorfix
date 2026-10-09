"use client";

import { useEffect, useRef } from "react";

import { INTRO_CONTOURS, INTRO_VIEWBOX as BOX } from "./intro-glyphs";

import "./intro-loader.css";

const SEEN_KEY = "dfx-intro-seen";
/** One pass of the pen across the whole word. */
const DRAW_MS = 2400;
/** How long the finished outline holds before the screen fades. */
const HOLD_MS = 350;
/** Keep in step with the fade in intro-loader.css. */
const EXIT_MS = 700;

/*
 * Runs before first paint: a visitor who has already seen the intro this
 * session, or prefers reduced motion, never sees the overlay at all.
 */
const SKIP_SCRIPT = `try{if(sessionStorage.getItem("${SEEN_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-intro-skip","")}catch(e){}`;

/*
 * Also before first paint, and again on resize: the pen is drawn in font units,
 * so its width is set to stay about 1.6px (2px on phones) on any screen.
 */
const PEN_SCRIPT = `(window.__dfxPen=function(){try{var s=document.querySelector(".intro-loader-word");var w=s&&s.getBoundingClientRect().width;if(w)document.documentElement.style.setProperty("--intro-pen",(innerWidth<640?2:1.6)*${BOX.width}/w+"px")}catch(e){}})()`;

/** Where each contour starts and how long it takes: one continuous pen across the word. */
const TOTAL = INTRO_CONTOURS.reduce((sum, contour) => sum + contour.length, 0);
const STROKES = INTRO_CONTOURS.map((contour, i) => {
  const before = INTRO_CONTOURS.slice(0, i).reduce((sum, c) => sum + c.length, 0);
  return {
    d: contour.d,
    // A touch long, so a contour always closes; the overshoot only ends its pass a moment early.
    dash: Math.ceil(contour.length * 1.02),
    delay: Math.round((before / TOTAL) * DRAW_MS),
    duration: Math.round((contour.length / TOTAL) * DRAW_MS),
  };
});

/**
 * Site intro, once per session: a red pen writes DEKORFIX in outline on a white
 * screen, letter after letter, and the screen fades away once the page has
 * loaded. The outline is plain SVG paths drawn by CSS, so it starts with the
 * first paint and looks the same in every browser, before any font or script
 * has loaded. Decorative, so hidden from assistive technology.
 */
export function IntroLoader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    if (!root) return;
    if (html.hasAttribute("data-intro-skip") || getComputedStyle(root).display === "none") {
      root.hidden = true;
      return;
    }

    const timers: number[] = [];
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((resolve) => timers.push(window.setTimeout(resolve, ms)));

    html.style.overflow = "hidden";
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}

    const resize = () => (window as Window & { __dfxPen?: () => void }).__dfxPen?.();
    window.addEventListener("resize", resize);

    // The pen has been writing since first paint; this waits for the strokes still running.
    const strokes = Array.from(root.querySelectorAll("path"));
    const written = Promise.all(strokes.flatMap((stroke) => stroke.getAnimations?.() ?? []).map((animation) => animation.finished)).catch(
      () => undefined,
    );
    const pageLoaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });

    void written
      .then(() => Promise.all([wait(HOLD_MS), pageLoaded]))
      .then(() => {
        if (cancelled) return;
        root.dataset.state = "done";
        return wait(EXIT_MS).then(() => {
          root.hidden = true;
          html.style.overflow = "";
        });
      });

    return () => {
      cancelled = true;
      timers.forEach((timer) => clearTimeout(timer));
      window.removeEventListener("resize", resize);
      html.style.overflow = "";
    };
  }, []);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }} />
      <div ref={rootRef} aria-hidden className="intro-loader">
        <svg
          viewBox={`${BOX.x} ${BOX.y} ${BOX.width} ${BOX.height}`}
          width={BOX.width}
          height={BOX.height}
          className="intro-loader-word"
        >
          <defs>
            <linearGradient id="intro-ink" gradientUnits="userSpaceOnUse" x1={BOX.x} x2={BOX.x + BOX.width} y1="0" y2="0">
              <stop offset="0%" stopColor="#b3171d" />
              <stop offset="100%" stopColor="#e41e25" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#intro-ink)" strokeLinejoin="round" strokeLinecap="round" className="intro-loader-pen">
            {STROKES.map((stroke) => (
              <path
                key={stroke.d}
                d={stroke.d}
                style={{
                  strokeDasharray: `${stroke.dash} 100000`,
                  strokeDashoffset: stroke.dash,
                  animationDelay: `${stroke.delay}ms`,
                  animationDuration: `${stroke.duration}ms`,
                }}
              />
            ))}
          </g>
        </svg>
        <script dangerouslySetInnerHTML={{ __html: PEN_SCRIPT }} />
      </div>
      <noscript>
        <style>{".intro-loader{display:none}"}</style>
      </noscript>
    </>
  );
}
