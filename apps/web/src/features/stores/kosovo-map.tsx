"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import { KOSOVO_BORDER, MAP_HEIGHT as H, MAP_WIDTH as W, MUNICIPALITIES, project } from "@/content/kosovo-map";
import { cn } from "@/lib/utils";

export interface MapCity {
  id: string;
  name: string;
  municipality: string;
  lat: number;
  lng: number;
  label: "left" | "right" | "above";
}

/** Closest the camera zooms in, and how much of the frame the factory-to-city span may fill. */
const MAX_ZOOM = 2.4;
const FILL = 0.55;
/** Below this rendered width pins and their city names are drawn smaller. */
const COMPACT_PX = 520;

/**
 * Kosovo with its 38 municipalities and the city pins. The border draws
 * itself, municipalities settle in and pins drop once the map scrolls into
 * view. Choosing a city moves the camera to frame the factory and that
 * city, and a route runs from the factory to it. Pins and lines are sized in
 * screen pixels (via --u, map units per pixel, and --z, the zoom), so they
 * stay crisp at every map size and zoom.
 */
export function KosovoMap({
  cities,
  factory,
  selected,
  hovered,
  onSelect,
  onHover,
  labels,
}: {
  cities: MapCity[];
  factory: { lat: number; lng: number; municipality: string };
  selected: string | null;
  hovered: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  labels: { map: string; factory: string; factoryPlace: string };
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [ready, setReady] = useState(false);
  const [unitsPerPx, setUnitsPerPx] = useState(1.3);

  // Play the intro once the map is on screen, and keep pins at a constant on-screen size.
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const seen = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          seen.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    seen.observe(svg);
    const size = new ResizeObserver(() => {
      const box = svg.getBoundingClientRect();
      // The drawing is letterboxed (meet): the scale is set by the tighter side.
      const scale = Math.min(box.width / W, box.height / H);
      if (scale > 0) setUnitsPerPx(1 / scale);
    });
    size.observe(svg);
    return () => {
      seen.disconnect();
      size.disconnect();
    };
  }, []);

  const origin = project(factory.lat, factory.lng);
  const active = cities.find((city) => city.id === selected) ?? null;
  const target = active ? project(active.lat, active.lng) : null;

  // Camera: frame the factory and the chosen city together, or the whole country.
  let zoom = 1;
  let center = { x: W / 2, y: H / 2 };
  if (target) {
    const span = Math.max(Math.abs(target.x - origin.x) / W, Math.abs(target.y - origin.y) / H, 0.01);
    zoom = Math.min(MAX_ZOOM, Math.max(1, FILL / span));
    center = { x: (target.x + origin.x) / 2, y: (target.y + origin.y) / 2 };
  }
  const camera = `translate(${W / 2 - center.x * zoom}px, ${H / 2 - center.y * zoom}px) scale(${zoom})`;
  const compact = W / unitsPerPx < COMPACT_PX;
  const focusMunicipality = cities.find((city) => city.id === (hovered ?? selected))?.municipality;

  const pinKeys = (id: string) => (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(id === selected ? null : id);
    }
    if (event.key === "Escape") onSelect(null);
  };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      role="group"
      aria-label={labels.map}
      data-ready={ready || undefined}
      data-compact={compact || undefined}
      data-active={active ? true : undefined}
      className="sl-svg"
      style={{ "--u": unitsPerPx, "--z": zoom } as CSSProperties}
      onClick={(event) => {
        // A click on empty sea or land (not a pin) shows all of Kosovo again.
        if (event.target === event.currentTarget || (event.target as Element).classList.contains("sl-muni")) onSelect(null);
      }}
    >
      <defs>
        <filter id="sl-lift" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#0d0d0c" floodOpacity="0.12" />
        </filter>
        <linearGradient id="sl-route-ink" gradientUnits="userSpaceOnUse" x1={origin.x} y1={origin.y} x2={target?.x ?? origin.x} y2={target?.y ?? origin.y}>
          <stop offset="0%" stopColor="#0d0d0c" />
          <stop offset="100%" stopColor="#e41e25" />
        </linearGradient>
      </defs>

      <g className="sl-camera" style={{ transform: camera }}>
        <path d={KOSOVO_BORDER} className="sl-land" filter="url(#sl-lift)" />
        <g>
          {MUNICIPALITIES.map((municipality, index) => (
            <path
              key={municipality.id}
              d={municipality.d}
              className={cn(
                "sl-muni",
                municipality.id === focusMunicipality && "sl-muni--focus",
                municipality.id === factory.municipality && "sl-muni--home",
              )}
              style={{ "--i": index } as CSSProperties}
            />
          ))}
        </g>
        <path d={KOSOVO_BORDER} pathLength={1} className="sl-border" />

        {target && <Route key={active?.id} from={origin} to={target} dot={(4.5 * unitsPerPx) / zoom} />}

        <g transform={`translate(${origin.x} ${origin.y})`} className={cn("sl-factory", active && "sl-factory--origin")}>
          <g className="sl-counter">
            <g className="sl-drop" style={{ "--i": cities.length } as CSSProperties}>
              <rect x="-9" y="-9" width="18" height="18" rx="2" className="sl-factory-mark" />
              <path d="M-4 3 L-1 -4 H4 L1 3 Z" fill="#e41e25" />
              <text x="0" y="28" textAnchor="middle" className="sl-label sl-factory-label">
                {labels.factory}
              </text>
              <title>{`${labels.factory}, ${labels.factoryPlace}`}</title>
            </g>
          </g>
        </g>

        {cities.map((city, index) => {
          const point = project(city.lat, city.lng);
          const isActive = city.id === selected;
          const isHovered = city.id === hovered;
          return (
            <g
              key={city.id}
              transform={`translate(${point.x} ${point.y})`}
              role="button"
              tabIndex={0}
              aria-label={city.name}
              aria-pressed={isActive}
              onClick={() => onSelect(isActive ? null : city.id)}
              onKeyDown={pinKeys(city.id)}
              onPointerEnter={() => onHover(city.id)}
              onPointerLeave={() => onHover(null)}
              onFocus={() => onHover(city.id)}
              onBlur={() => onHover(null)}
              className={cn(
                "sl-pin",
                isActive && "sl-pin--active",
                isHovered && "sl-pin--hover",
                active && !isActive && "sl-pin--dim",
              )}
            >
              <g className="sl-counter">
                <g className="sl-drop" style={{ "--i": index } as CSSProperties}>
                  <circle r="22" className="sl-hit" />
                  <circle r="8" className="sl-pulse" style={{ "--d": `${(index % 5) * 0.45}s` } as CSSProperties} />
                  <circle r="11" className="sl-ring" />
                  <circle r="6.5" className="sl-dot" />
                  <text
                    x={city.label === "above" ? 0 : city.label === "left" ? -16 : 16}
                    y={city.label === "above" ? -16 : 4.5}
                    textAnchor={city.label === "above" ? "middle" : city.label === "left" ? "end" : "start"}
                    className="sl-label"
                  >
                    {city.name}
                  </text>
                </g>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** The factory-to-city route: a curve that draws itself, with a dot travelling along it. */
function Route({
  from,
  to,
  dot,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  /** Radius of the travelling dot, in map units (about 4.5 screen pixels). */
  dot: number;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // Bow the curve to one side, by a fifth of its length.
  const control = { x: (from.x + to.x) / 2 - dy * 0.2, y: (from.y + to.y) / 2 + dx * 0.2 };
  const d = `M${from.x} ${from.y} Q${control.x} ${control.y} ${to.x} ${to.y}`;
  const seconds = Math.max(1.6, Math.hypot(dx, dy) / 160);
  return (
    <g className="sl-route" aria-hidden>
      <path d={d} pathLength={1} className="sl-route-line" />
      <path d={d} pathLength={1} className="sl-route-flow" />
      <circle r={dot} className="sl-route-dot">
        <animateMotion dur={`${seconds}s`} repeatCount="indefinite" path={d} keyTimes="0;1" keySplines="0.45 0 0.25 1" calcMode="spline" />
      </circle>
    </g>
  );
}
