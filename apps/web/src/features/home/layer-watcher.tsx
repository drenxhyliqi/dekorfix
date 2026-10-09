"use client";

import { useEffect } from "react";

import { layerProgress } from "./layer-progress";
import { PAINT_OVERHANG, PAINT_STROKES, WALL_WIDTH } from "./layer-wall";

/** How far each stroke starts after the one before it, as a share of the layer's progress. */
const STROKE_STAGGER = 0.14;
const NARROW = "(max-width: 1023px)";

/**
 * Drives the "layer by layer" section from the scroll. Renders nothing.
 *
 * - Shares each step's progress with the 3D house (layer-progress.ts).
 * - Paints each layer on as its step progresses: the layer's strokes grow left
 *   to right from its own edge, one after another, and recede when scrolling
 *   back. With the last step the finish is rolled over the whole wall, then
 *   the window appears.
 * - Marks layers, packshot rows and steps as done / active / next
 *   (`data-state`) for the step text, tags and products.
 *
 * Desktop: each step's progress comes from its own position as it scrolls
 * past. Narrow screens: the block is pinned, so progress comes from how far
 * the page has scrolled through the section, one equal stretch per step.
 */
export function LayerWatcher({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const body = section.querySelector<HTMLElement>(".ls-body");
    const pin = section.querySelector<HTMLElement>(".ls-pin");
    const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-step]"));
    const stateful = Array.from(section.querySelectorAll<HTMLElement | SVGElement>("[data-layer]"));
    const strokes = Array.from(section.querySelectorAll<SVGRectElement>("[data-paint]"));
    const stages = Array.from(section.querySelectorAll<HTMLElement>("[data-stage]"));
    const windowPane = section.querySelector<SVGGElement>(".ls-window");
    const narrow = window.matchMedia(NARROW);
    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    let current = -1;
    const show = (active: number) => {
      if (active === current) return;
      current = active;
      const state = (index: number) => (index < active ? "done" : index === active ? "active" : "next");
      for (const el of stateful) el.dataset.state = state(Number(el.dataset.layer));
      for (const el of steps) el.dataset.state = state(Number(el.dataset.step));
    };

    /** Progress of each step (0 → 1) and which step is current. */
    const measure = (): { progress: number[]; active: number } => {
      const count = steps.length;
      if (narrow.matches && body && pin) {
        const travel = body.offsetHeight - pin.offsetHeight;
        const top = parseFloat(getComputedStyle(pin).top) || 0;
        const through = clamp((top - body.getBoundingClientRect().top) / Math.max(1, travel)) * count;
        return {
          // Each layer is fully painted by 80% of its stretch, then holds.
          progress: steps.map((_, i) => clamp((through - i) / 0.8)),
          active: Math.min(count - 1, Math.floor(through)),
        };
      }
      const view = window.innerHeight;
      let active = 0;
      const progress = steps.map((step, i) => {
        const rect = step.getBoundingClientRect();
        if (rect.top <= view * 0.5) active = i;
        return clamp((view * 0.85 - rect.top) / (rect.height * 0.75));
      });
      return { progress, active };
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const { progress, active } = measure();
      show(active);
      // The 3D house reads these on its next frame.
      layerProgress.values = progress;
      layerProgress.active = active;
      // The house's label names the layer going on now, which leads the step text a little.
      let stage = 0;
      progress.forEach((value, index) => {
        if (value > 0.04) stage = index;
      });
      for (const el of stages) el.dataset.state = Number(el.dataset.stage) === stage ? "active" : "next";
      progress.forEach((value, layer) => {
        let p = value;
        // The finished wall: the finish is rolled over the first 60%, then the window appears.
        if (layer === steps.length - 1) {
          if (windowPane) windowPane.style.opacity = String(clamp((p - 0.6) / 0.3));
          p = clamp(p / 0.6);
        }
        const span = 1 + (PAINT_STROKES - 1) * STROKE_STAGGER;
        for (const stroke of strokes) {
          if (Number(stroke.dataset.paint) !== layer) continue;
          const index = Array.prototype.indexOf.call(stroke.parentNode?.children ?? [], stroke);
          const share = clamp(p * span - index * STROKE_STAGGER);
          // From the layer's own edge to past the right side of the wall.
          const full = WALL_WIDTH + PAINT_OVERHANG - Number(stroke.getAttribute("x"));
          stroke.setAttribute("width", (share * full).toFixed(1));
        }
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    narrow.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      narrow.removeEventListener("change", schedule);
    };
  }, [sectionId]);

  return null;
}
