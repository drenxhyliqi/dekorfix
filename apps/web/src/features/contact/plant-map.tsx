import type { CSSProperties } from "react";

import { KOSOVO_BORDER, MAP_HEIGHT as H, MAP_WIDTH as W, MUNICIPALITIES, project } from "@/content/kosovo-map";

/**
 * Kosovo with the plant's municipality picked out, a pulsing pin at Shirokë
 * and a line to each of the main cities, drawn in when the page loads.
 * Server-rendered; the animation is CSS only.
 */
export function PlantMap({
  plant,
  cities,
  label,
  plantLabel,
}: {
  plant: { lat: number; lng: number; municipality: string };
  cities: Array<{ name: string; lat: number; lng: number; km: number; side: "left" | "right" }>;
  label: string;
  plantLabel: string;
}) {
  const origin = project(plant.lat, plant.lng);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="ct-map">
      <path d={KOSOVO_BORDER} className="ct-map-land" />
      {MUNICIPALITIES.map((municipality) => (
        <path
          key={municipality.id}
          d={municipality.d}
          className={municipality.id === plant.municipality ? "ct-map-muni ct-map-muni--home" : "ct-map-muni"}
        />
      ))}
      <path d={KOSOVO_BORDER} className="ct-map-border" />

      {cities.map((city, index) => {
        const point = project(city.lat, city.lng);
        const left = city.side === "left";
        return (
          <g key={city.name} style={{ "--i": index } as CSSProperties}>
            <line x1={origin.x} y1={origin.y} x2={point.x} y2={point.y} pathLength={1} className="ct-map-line" />
            <g transform={`translate(${point.x} ${point.y})`} className="ct-map-city">
              <circle r="9" />
              <text x={left ? -18 : 18} y="-4" textAnchor={left ? "end" : "start"} className="ct-map-name">
                {city.name}
              </text>
              <text x={left ? -18 : 18} y="26" textAnchor={left ? "end" : "start"} className="ct-map-km">
                {city.km} km
              </text>
            </g>
          </g>
        );
      })}

      <g transform={`translate(${origin.x} ${origin.y})`} className="ct-map-plant">
        <circle r="34" className="ct-map-pulse" />
        <circle r="34" className="ct-map-pulse ct-map-pulse--late" />
        <rect x="-20" y="-20" width="40" height="40" rx="5" className="ct-map-plant-mark" />
        <path d="M-9 7 L-3 -9 H10 L3 7 Z" fill="#e41e25" />
        <text y="-46" textAnchor="middle" className="ct-map-plant-label">
          {plantLabel}
        </text>
      </g>
    </svg>
  );
}
