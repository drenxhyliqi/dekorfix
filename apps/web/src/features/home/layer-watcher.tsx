"use client";

import { useEffect } from "react";

import { PAINT_OVERHANG, PAINT_STROKES, WALL_WIDTH } from "./layer-wall";

/** How far each stroke starts after the one before it, as a share of the layer's progress. */
const STROKE_STAGGER = 0.14;

/**
 * Drives the "layer by layer" section from the scroll. Renders nothing.
 *
 * - Paints each layer on as its step scrolls through the screen: the layer's
 *   strokes grow left to right from its own edge, one after another, and
 *   recede when scrolling back. With the last step the finish is rolled over
 *   the whole wall, then the window appears.
 * - Marks layers, packshot rows and steps as done / active / next
 *   (`data-state`) for the step text, tags and products.
 */
export function LayerWatcher({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-step]"));
    const stateful = Array.from(section.querySelectorAll<HTMLElement | SVGElement>("[data-layer]"));
    const strokes = Array.from(section.querySelectorAll<SVGRectElement>("[data-paint]"));
    const windowPane = section.querySelector<SVGGElement>(".ls-window");
    const narrow = window.matchMedia("(max-width: 1023px)").matches;

    // ---- States: the step crossing a thin band of the viewport is active. ----
    const show = (active: number) => {
      const state = (index: number) => (index < active ? "done" : index === active ? "active" : "next");
      for (const el of stateful) el.dataset.state = state(Number(el.dataset.layer));
      for (const el of steps) el.dataset.state = state(Number(el.dataset.step));
    };
    show(0);
    // On narrow screens the wall is pinned over the top, so the band sits lower.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) show(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: narrow ? "-62% 0px -33% 0px" : "-45% 0px -45% 0px" },
    );
    steps.forEach((step) => observer.observe(step));

    // ---- Painting: progress of each step through the screen, 0 → 1. ----
    const progress = (step: HTMLElement) => {
      const rect = step.getBoundingClientRect();
      const start = window.innerHeight * (narrow ? 0.98 : 0.85);
      return Math.min(1, Math.max(0, (start - rect.top) / (rect.height * 0.75)));
    };

    let frame = 0;
    const paint = () => {
      frame = 0;
      steps.forEach((step, layer) => {
        let p = progress(step);
        // The finished wall: the finish is rolled over the first 60%, then the window appears.
        if (layer === steps.length - 1) {
          if (windowPane) windowPane.style.opacity = String(Math.min(1, Math.max(0, (p - 0.6) / 0.3)));
          p = Math.min(1, p / 0.6);
        }
        const span = 1 + (PAINT_STROKES - 1) * STROKE_STAGGER;
        for (const stroke of strokes) {
          if (Number(stroke.dataset.paint) !== layer) continue;
          const index = Array.prototype.indexOf.call(stroke.parentNode?.children ?? [], stroke);
          const share = Math.min(1, Math.max(0, p * span - index * STROKE_STAGGER));
          // From the layer's own edge to past the right side of the wall.
          const full = WALL_WIDTH + PAINT_OVERHANG - Number(stroke.getAttribute("x"));
          stroke.setAttribute("width", (share * full).toFixed(1));
        }
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sectionId]);

  return null;
}
