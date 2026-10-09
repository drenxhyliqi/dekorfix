"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface BoardCountry {
  id: string;
  code: string;
  name: string;
  capital: string;
  km: number;
}

const FLAP_CHARS = "ABCDEFGHIJKLMNOPRSTUVZ0123456789";
const DIGITS = "0123456789";

/**
 * The export map beside a "departures board" of the export countries. The
 * board flips its letters and numbers in when it scrolls into view; pointing
 * at or choosing a row (or a country on the map) brings out that route.
 */
export function ExportExplorer({
  map,
  countries,
  copy,
}: {
  map: ReactNode;
  countries: BoardCountry[];
  copy: {
    board: string;
    from: string;
    destination: string;
    distance: string;
    status: string;
    active: string;
    clock: string;
  };
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const focus = hovered ?? selected;

  // Intro once on screen; --u keeps map labels and dots at screen size.
  useEffect(() => {
    const root = rootRef.current;
    const frame = mapRef.current;
    if (!root || !frame) return;
    const seen = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          seen.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    seen.observe(root);
    const size = new ResizeObserver(() => {
      const svg = frame.querySelector("svg");
      const box = svg?.getBoundingClientRect();
      const viewBox = svg?.viewBox.baseVal;
      if (box && viewBox && box.width > 0) {
        frame.style.setProperty("--u", String(Math.min(viewBox.width / box.width, viewBox.height / box.height)));
      }
    });
    size.observe(frame);
    return () => {
      seen.disconnect();
      size.disconnect();
    };
  }, []);

  // The map is server-rendered markup: mark the focused country's shapes directly.
  useEffect(() => {
    for (const el of mapRef.current?.querySelectorAll<SVGElement>("[data-country]") ?? []) {
      if (el.dataset.country === focus) el.setAttribute("data-on", "");
      else el.removeAttribute("data-on");
    }
  }, [focus]);

  const countryAt = (target: EventTarget | null) =>
    target instanceof Element ? (target.closest<SVGElement>("[data-country]")?.dataset.country ?? null) : null;

  return (
    <div
      ref={rootRef}
      data-inview={inView || undefined}
      data-focus={focus ?? undefined}
      className="ex grid gap-8 lg:grid-cols-12 lg:gap-10"
    >
      <div
        ref={mapRef}
        className="ex-frame lg:col-span-7"
        onPointerOver={(event) => setHovered(countryAt(event.target))}
        onPointerLeave={() => setHovered(null)}
        onClick={(event) => {
          const id = countryAt(event.target);
          setSelected((current) => (id && id !== current ? id : null));
        }}
      >
        {map}
      </div>

      <div className="ex-board lg:col-span-5">
        <div className="ex-board-head">
          <p className="flex items-center gap-2.5 text-label uppercase text-text">
            <span aria-hidden className="ex-board-light" />
            {copy.board}
          </p>
          <Clock label={copy.clock} />
        </div>
        <p className="ex-board-from">{copy.from}</p>

        <div aria-hidden className="ex-row ex-row--head">
          <span>{copy.destination}</span>
          <span className="text-right">{copy.distance}</span>
          <span className="hidden text-right sm:block">{copy.status}</span>
        </div>
        <ul>
          {countries.map((country, index) => (
            <li key={country.id} className="ex-item" style={{ "--i": index } as CSSProperties}>
              <button
                type="button"
                aria-pressed={selected === country.id}
                onPointerEnter={() => setHovered(country.id)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(country.id)}
                onBlur={() => setHovered(null)}
                onClick={() => setSelected((current) => (current === country.id ? null : country.id))}
                className={cn("ex-row", focus === country.id && "ex-row--on", focus && focus !== country.id && "ex-row--dim")}
              >
                <span className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <span aria-hidden className="ex-tiles">
                    <Flap text={country.code} run={inView} delay={index * 140} chars={FLAP_CHARS} tiles />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[1.0625rem] font-semibold tracking-[-0.01em] text-text sm:text-h4">
                      {country.name}
                    </span>
                    <span className="mt-0.5 block truncate text-small text-text-tertiary">{country.capital}</span>
                  </span>
                </span>
                <span className="text-right tabular-nums text-text">
                  <span className="sr-only">{`${country.km} km`}</span>
                  <span aria-hidden className="text-[1.0625rem] font-semibold">
                    <Flap text={country.km.toLocaleString("de-DE")} run={inView} delay={240 + index * 140} chars={DIGITS} />
                  </span>
                  <span aria-hidden className="ml-1 text-small text-text-tertiary">
                    km
                  </span>
                </span>
                <span className="hidden items-center justify-end gap-2 text-small text-text-secondary sm:flex">
                  <span aria-hidden className="ex-status-dot" />
                  {copy.active}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Text that flips into place like a split-flap board: each character runs
 * through `chars` and lands, left to right. Shows the final text until
 * `run`, and straight away with reduced motion.
 */
function Flap({
  text,
  run,
  delay,
  chars,
  tiles = false,
}: {
  text: string;
  run: boolean;
  delay: number;
  chars: string;
  tiles?: boolean;
}) {
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (!run || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now() + delay;
    let frame = 0;
    let last = 0;
    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      if (now - last < 55) return;
      last = now;
      const elapsed = now - start;
      if (elapsed < 0) return;
      let done = true;
      const next = Array.from(text, (char, i) => {
        // Separators stay put; each character settles 110 ms after the one before.
        if (!chars.includes(char) || elapsed > 380 + i * 110) return char;
        done = false;
        return chars[Math.floor(Math.random() * chars.length)] ?? char;
      }).join("");
      setShown(next);
      if (done) cancelAnimationFrame(frame);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      setShown(text);
    };
  }, [run, text, delay, chars]);

  if (!tiles) return <>{shown}</>;
  return (
    <>
      {Array.from(shown, (char, i) => (
        <span key={i} className="ex-tile">
          {char}
        </span>
      ))}
    </>
  );
}

/** Local time at the factory, like the clock on a departures board. Rendered after mount only. */
function Clock({ label }: { label: string }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Belgrade" });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 15_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <p className="text-small tabular-nums text-text-secondary">
      {label} <span className="ex-clock font-semibold text-text">{time ?? "--:--"}</span>
    </p>
  );
}
