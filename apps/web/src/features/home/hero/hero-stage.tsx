"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { heroState } from "./hero-state";

// three.js and the scene are split out and only fetched after the page is idle.
const StyrofiberScene = dynamic(() => import("./styrofiber-scene"), { ssr: false });

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Pinned hero stage. Scroll progress drives the typography through the
 * `--hero-p` custom property and the 3D sack through `heroState`, so neither
 * re-renders React on scroll. The static poster stays visible until the
 * scene has rendered its first frame (or forever without WebGL).
 */
export function HeroStage({ poster, children }: { poster: ReactNode; children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mountScene, setMountScene] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      heroState.reducedMotion = motionQuery.matches;
      section.dataset.motion = motionQuery.matches ? "reduced" : "full";
    };
    syncMotion();
    motionQuery.addEventListener("change", syncMotion);

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const stage = section.firstElementChild as HTMLElement | null;
      const travel = rect.height - (stage?.offsetHeight ?? window.innerHeight);
      const progress = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0;
      heroState.progress = progress;
      section.style.setProperty("--hero-p", progress.toFixed(4));
      // Interactive act-2 content is only reachable once it is visible.
      section.dataset.act = progress > 0.45 ? "2" : "1";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      heroState.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      heroState.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const observer = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)));
    observer.observe(section);

    // Defer the WebGL scene until the browser is idle so it never competes
    // with the first paint of the page.
    let cancelIdle = () => {};
    if (supportsWebGL()) {
      const start = () => {
        setCompact(window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4);
        setMountScene(true);
      };
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(start, { timeout: 1500 });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const id = setTimeout(start, 600);
        cancelIdle = () => clearTimeout(id);
      }
    }

    return () => {
      motionQuery.removeEventListener("change", syncMotion);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", onPointer);
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelIdle();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      data-ready={ready}
      data-act="1"
      style={{ "--hero-p": 0 } as CSSProperties}
      className="group/hero relative h-[180svh] bg-surface-muted md:h-[230svh] data-[motion=reduced]:h-auto"
    >
      <div className="sticky top-16 h-[calc(100svh-4rem)] min-h-[34rem] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ease-out group-data-[ready=true]/hero:opacity-0"
        >
          {poster}
        </div>
        {mountScene && (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ease-out",
              ready ? "opacity-100" : "opacity-0",
            )}
          >
            <StyrofiberScene compact={compact} active={active} onReady={() => setReady(true)} />
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
