"use client";

import { useEffect, useRef } from "react";

import "./intro-loader.css";

const WORD = "DEKORFIX";
const WEIGHT = 800;
const SEEN_KEY = "dfx-intro-seen";
/** One pass of the pen across the whole word. */
const DRAW_MS = 2400;
/** How long the finished outline holds before the screen fades. */
const HOLD_MS = 350;
/** Keep in step with the fade in intro-loader.css. */
const EXIT_MS = 700;
const FONT_TIMEOUT_MS = 1500;
/** Pen width on screen, in pixels; a touch heavier on small screens. */
const penPx = () => (window.innerWidth < 640 ? 2 : 1.6);

/*
 * Runs before first paint: a visitor who has already seen the intro this
 * session, or prefers reduced motion, never sees the overlay at all.
 */
const SKIP_SCRIPT = `try{if(sessionStorage.getItem("${SEEN_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-intro-skip","")}catch(e){}`;

/**
 * Site intro, once per session: a red pen writes DEKORFIX in outline on a white
 * screen, letter after letter, and the screen fades away once the page has
 * loaded. Decorative, so hidden from assistive technology.
 */
export function IntroLoader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    if (!root) return;
    if (html.hasAttribute("data-intro-skip")) {
      root.hidden = true;
      return;
    }

    const svg = root.querySelector("svg")!;
    const strokes = Array.from(root.querySelectorAll<SVGTextElement>("[data-intro-stroke]"));
    const maskText = root.querySelector<SVGTextElement>("[data-intro-mask]")!;
    const ink = root.querySelector<SVGLinearGradientElement>("linearGradient")!;
    const timers: number[] = [];
    let raf = 0;
    let cancelled = false;

    html.style.overflow = "hidden";
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}

    const finish = () => {
      root.dataset.state = "done";
      timers.push(
        window.setTimeout(() => {
          root.hidden = true;
          html.style.overflow = "";
        }, EXIT_MS),
      );
    };

    const pageLoaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });

    const start = () => {
      if (cancelled) return;
      const family = getComputedStyle(maskText).fontFamily;
      const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      if (!context) return finish();

      // Measure at 100px: the word's visible ink, each letter's advance and outline length.
      context.font = `${WEIGHT} 100px ${family}`;
      context.fontKerning = "none";
      const word = context.measureText(WORD);
      // Advances first: measuring outlines resets the canvas to another size.
      const advances = Array.from(WORD, (_, i) => context.measureText(WORD.slice(0, i)).width);
      const letters = Array.from(WORD, (char, i) => ({
        advance: advances[i] ?? 0,
        // A touch long, so a letter always closes; an overshoot only ends its pass a moment early.
        length: outlineLength(context, char, `${WEIGHT} 300px ${family}`) * 1.06,
      }));
      const total = letters.reduce((sum, letter) => sum + letter.length, 0);
      const box = {
        x: -word.actualBoundingBoxLeft,
        y: -word.actualBoundingBoxAscent,
        width: word.actualBoundingBoxLeft + word.actualBoundingBoxRight,
        height: word.actualBoundingBoxAscent + word.actualBoundingBoxDescent,
      };
      if (!box.width || !total) return finish();

      const pad = 4;
      svg.setAttribute("viewBox", `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`);
      ink.setAttribute("x1", String(box.x));
      ink.setAttribute("x2", String(box.x + box.width));
      // Doubled: the mask keeps only the half of the stroke outside the ink.
      const unitsPerPx = (box.width + pad * 2) / Math.max(1, svg.getBoundingClientRect().width);
      letters.forEach((letter, i) => {
        const stroke = strokes[i];
        if (!stroke) return;
        stroke.setAttribute("x", String(letter.advance));
        stroke.setAttribute("stroke-width", String(penPx() * 2 * unitsPerPx));
        stroke.style.strokeDasharray = `${letter.length} 100000`;
        stroke.style.strokeDashoffset = String(letter.length);
      });
      root.dataset.state = "drawing";

      let began = 0;
      const draw = (now: number) => {
        if (cancelled) return;
        began ||= now;
        const share = Math.min(1, (now - began) / DRAW_MS);
        // One continuous pen: each letter is written after the one before it.
        let remaining = share * total;
        letters.forEach((letter, i) => {
          const visible = Math.min(letter.length, Math.max(0, remaining));
          remaining -= letter.length;
          strokes[i]?.style.setProperty("stroke-dashoffset", String(letter.length - visible));
        });
        if (share < 1) {
          raf = requestAnimationFrame(draw);
          return;
        }
        // The last letter is written: hold the outline a moment, then leave once the page is ready.
        const settled = new Promise((resolve) => timers.push(window.setTimeout(resolve, HOLD_MS)));
        void Promise.all([settled, pageLoaded]).then(() => !cancelled && finish());
      };
      raf = requestAnimationFrame(draw);
    };

    // Measure only once the face is loaded, or the outline would not match the letters.
    const spec = `${WEIGHT} 100px ${getComputedStyle(maskText).fontFamily}`;
    const timeout = new Promise((resolve) => timers.push(window.setTimeout(resolve, FONT_TIMEOUT_MS)));
    void Promise.race([document.fonts.load(spec, WORD).catch(() => undefined), timeout]).then(start);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach((timer) => clearTimeout(timer));
      html.style.overflow = "";
    };
  }, []);

  const glyphs = Array.from(WORD);
  const font = { fontFamily: "var(--font-geist), sans-serif", fontWeight: WEIGHT, fontSize: 100 } as const;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }} />
      <div ref={rootRef} aria-hidden className="intro-loader">
        <svg viewBox="0 0 560 80" className="intro-loader-word">
          <defs>
            <linearGradient id="intro-ink" gradientUnits="userSpaceOnUse" x1="0" x2="560" y1="0" y2="0">
              <stop offset="0%" stopColor="#b3171d" />
              <stop offset="100%" stopColor="#e41e25" />
            </linearGradient>
            {/* Hides the stroke inside the ink: overlapping contours (as in a variable
                font's F) would otherwise show as lines across the letters. */}
            <mask id="intro-outside" maskUnits="userSpaceOnUse" x="-500" y="-500" width="2000" height="1000">
              <rect x="-500" y="-500" width="2000" height="1000" fill="#fff" />
              <text data-intro-mask x="0" y="0" fill="#000" className="intro-loader-text" style={font}>
                {WORD}
              </text>
            </mask>
          </defs>
          <g mask="url(#intro-outside)">
            {glyphs.map((char, i) => (
              <text
                key={i}
                data-intro-stroke
                x="0"
                y="0"
                fill="none"
                stroke="url(#intro-ink)"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="intro-loader-text"
                style={font}
              >
                {char}
              </text>
            ))}
          </g>
        </svg>
      </div>
      <noscript>
        <style>{".intro-loader{display:none}"}</style>
      </noscript>
    </>
  );
}

/**
 * Length of a glyph's outline at SVG size, from the ink of a thin canvas
 * stroke (stroke area ÷ line width). Canvas can use the page's web fonts.
 */
function outlineLength(context: CanvasRenderingContext2D, char: string, font: string): number {
  const canvas = context.canvas;
  context.font = font;
  const m = context.measureText(char);
  const pad = 8;
  const line = 3;
  const left = Math.ceil(m.actualBoundingBoxLeft);
  const ascent = Math.ceil(m.actualBoundingBoxAscent);
  canvas.width = Math.max(1, Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2);
  canvas.height = Math.max(1, Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2);
  context.font = font;
  context.fontKerning = "none";
  context.lineWidth = line;
  context.lineJoin = "round";
  context.strokeText(char, pad + left, pad + ascent);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let ink = 0;
  for (let i = 3; i < pixels.length; i += 4) ink += pixels[i] ?? 0;
  // Scanned at 3× SVG size.
  return ink / 255 / line / 3;
}
