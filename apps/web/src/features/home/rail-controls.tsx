"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * Previous / next buttons for a horizontal scroll rail (found by id). Each
 * press moves by one card; a button is disabled at its end of the rail.
 * Hidden on touch screens, where the rail is swiped.
 */
export function RailControls({
  railId,
  previousLabel,
  nextLabel,
}: {
  railId: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const previous = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const rail = document.getElementById(railId);
    if (!rail) return;
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      if (previous.current) previous.current.disabled = rail.scrollLeft <= 2;
      if (next.current) next.current.disabled = rail.scrollLeft >= max;
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [railId]);

  const move = (direction: 1 | -1) => {
    const rail = document.getElementById(railId);
    const card = rail?.querySelector("li");
    if (!rail || !card) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  const button =
    "inline-flex size-11 items-center justify-center rounded-sm border border-border-strong text-text transition-colors duration-150 hover:border-brand hover:bg-brand hover:text-white disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="fp-controls">
      <button ref={previous} type="button" aria-label={previousLabel} aria-controls={railId} onClick={() => move(-1)} className={button}>
        <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
      </button>
      <button ref={next} type="button" aria-label={nextLabel} aria-controls={railId} onClick={() => move(1)} className={button}>
        <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
