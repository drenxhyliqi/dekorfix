import type { CSSProperties } from "react";

import { EUROPE_COUNTRIES, EUROPE_HEIGHT as H, EUROPE_LAND, EUROPE_WIDTH as W, projectEurope } from "@/content/europe-map";
import type { ExportCountry } from "@/content/export";

/**
 * Europe with a route from the factory to each export country's capital. Drawn
 * on the server; ExportExplorer (around it) plays the intro when it scrolls
 * into view and marks the country chosen on the board (`data-on` on every
 * element with its `data-country`). Labels and dots are sized in screen pixels
 * via --u (map units per pixel), which ExportExplorer sets.
 */
export function ExportMap({
  countries,
  factory,
  label,
  factoryLabel,
}: {
  countries: Array<Pick<ExportCountry, "id" | "capital"> & { name: string }>;
  factory: { lat: number; lng: number };
  label: string;
  factoryLabel: string;
}) {
  const origin = projectEurope(factory.lat, factory.lng);
  const routes = countries.map((country, index) => {
    const to = projectEurope(country.capital.lat, country.capital.lng);
    const dx = to.x - origin.x;
    const dy = to.y - origin.y;
    const length = Math.hypot(dx, dy);
    // Bow each route to its northern side, by a fifth of its length.
    let nx = -dy / length;
    let ny = dx / length;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const bow = length * 0.2;
    const control = { x: (origin.x + to.x) / 2 + nx * bow, y: (origin.y + to.y) / 2 + ny * bow };
    const d = `M${origin.x.toFixed(1)} ${origin.y.toFixed(1)} Q${control.x.toFixed(1)} ${control.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
    return { ...country, index, to, d, seconds: Math.max(2.4, length / 110) };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="ex-svg">
      <path d={EUROPE_LAND} className="ex-land" />
      {routes.map((route) => (
        <path
          key={route.id}
          d={EUROPE_COUNTRIES[route.id]}
          data-country={route.id}
          className="ex-country"
          style={{ "--i": route.index } as CSSProperties}
        />
      ))}
      <path d={EUROPE_COUNTRIES.kosovo} className="ex-kosovo" />

      {routes.map((route) => (
        <g key={route.id} data-country={route.id} className="ex-route" style={{ "--i": route.index } as CSSProperties}>
          <path d={route.d} pathLength={1} className="ex-arc" />
          <path d={route.d} pathLength={1} className="ex-flow" />
          <circle r="5" className="ex-packet">
            <animateMotion
              dur={`${route.seconds.toFixed(1)}s`}
              begin={`${(route.index * 0.55).toFixed(2)}s`}
              repeatCount="indefinite"
              path={route.d}
              keyTimes="0;1"
              keySplines="0.45 0 0.25 1"
              calcMode="spline"
            />
          </circle>
        </g>
      ))}

      {routes.map((route) => (
        <g
          key={route.id}
          data-country={route.id}
          className="ex-dest"
          transform={`translate(${route.to.x.toFixed(1)} ${route.to.y.toFixed(1)})`}
          style={{ "--i": route.index } as CSSProperties}
        >
          <g className="ex-scale">
            <circle r="9" className="ex-dest-pulse" />
            <circle r="5.5" className="ex-dest-dot" />
            <text x="11" y="4" className="ex-label">
              {route.name}
            </text>
          </g>
        </g>
      ))}

      <g transform={`translate(${origin.x.toFixed(1)} ${origin.y.toFixed(1)})`} className="ex-origin">
        <g className="ex-scale">
          <circle r="16" className="ex-origin-pulse" />
          <rect x="-8" y="-8" width="16" height="16" rx="2" className="ex-origin-mark" />
          <path d="M-3.5 3 L-1 -3.5 H3.5 L1 3 Z" fill="#e41e25" />
          <text x="0" y="26" textAnchor="middle" className="ex-label ex-label--origin">
            {factoryLabel}
          </text>
        </g>
      </g>
    </svg>
  );
}
