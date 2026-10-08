"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

import { Dimension } from "./plan-view";
import { useCopy } from "./studio-copy";
import { useStudio } from "./studio-store";
import {
  facadeArea,
  facadeLength,
  facadeOutline,
  floorLevel,
  hasMesh,
  isGableEnd,
  ridgeAlongLength,
  roofRise,
  wallHeight,
} from "../model/calculations";
import { finishSystems } from "../model/systems";
import type { Balcony, Building, FacadeId, Opening } from "../model/types";

const SNAP = 0.05;
const snap = (value: number) => Math.round(value / SNAP) * SNAP;
/** Roof overhang drawn beyond the walls (illustrative). */
const EAVES = 0.45;
export const ROOF_COLOR = "#b4705b";

/** Elevation of the selected facade, seen from outside. Openings can be dragged within their floor. */
export function ElevationView() {
  const { state, dispatch } = useStudio();
  const { t, num, facadeName, floorName } = useCopy();
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; x: number; y: number; offset: number; sill: number } | null>(null);

  const { project, selected: facade } = state;
  const { building } = project;
  const len = facadeLength(building, facade);
  const H = wallHeight(building);
  const surface = project.facades[facade];
  const system = surface.systemId ? finishSystems[surface.systemId] : undefined;
  const meshed = hasMesh(system, surface.mesh);
  const outline = facadeOutline(building, facade);
  const top = Math.max(H + roofRise(building) + 0.3, ...outline.map(([, z]) => z));
  const k = Math.max(len, top) / 10;
  const margin = 1.1 * k + 0.4;
  const area = facadeArea(project, facade);
  // SVG y grows downwards; heights are measured up from the ground.
  const y = (z: number) => top - z;

  const toMetres = (event: PointerEvent) => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
  };
  const startDrag = (opening: Opening) => (event: PointerEvent<SVGGElement>) => {
    const p = toMetres(event);
    if (!p) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: opening.id, x: p.x, y: p.y, offset: opening.offset, sill: opening.sill };
  };
  const moveDrag = (opening: Opening) => (event: PointerEvent<SVGGElement>) => {
    const d = drag.current;
    if (!d || d.id !== opening.id) return;
    const p = toMetres(event);
    if (!p) return;
    dispatch({
      type: "updateOpening",
      facade,
      id: opening.id,
      patch: {
        offset: snap(d.offset + (p.x - d.x)),
        ...(opening.kind === "window" ? { sill: snap(d.sill - (p.y - d.y)) } : {}),
      },
    });
  };
  const endDrag = () => {
    drag.current = null;
  };
  const onKey = (opening: Opening) => (event: KeyboardEvent) => {
    const step = event.shiftKey ? 0.25 : SNAP;
    const moves: Record<string, Partial<Opening>> = {
      ArrowLeft: { offset: opening.offset - step },
      ArrowRight: { offset: opening.offset + step },
      ...(opening.kind === "window" ? { ArrowUp: { sill: opening.sill + step }, ArrowDown: { sill: opening.sill - step } } : {}),
    };
    const patch = moves[event.key];
    if (!patch) return;
    event.preventDefault();
    dispatch({ type: "updateOpening", facade, id: opening.id, patch });
  };

  const outlinePoints = outline.map(([s, z]) => `${s},${y(z)}`).join(" ");

  return (
    <div className="flex h-full flex-col">
      <svg
        ref={svgRef}
        // Left: room for the floor names; right: the height dimensions.
        viewBox={`${-(2.6 * k + 0.4)} ${-margin * 0.45} ${len + 2.6 * k + 0.4 + margin * 1.35} ${top + margin * 1.4}`}
        role="group"
        aria-label={`${t.elevation.label} ${facadeName(facade)}`}
        className="min-h-0 w-full flex-1 touch-none select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="elev-blocks" width={0.6} height={0.5} patternUnits="userSpaceOnUse" y={top % 0.5}>
            <rect width={0.6} height={0.5} fill="#d9d5cc" />
            <path d="M0 0.25H0.6M0 0.5H0.6M0.3 0V0.25M0 0.25V0.5M0.6 0.25V0.5" fill="none" stroke="#bcb6aa" strokeWidth={0.012} />
          </pattern>
          <pattern id="elev-mesh" width={0.05} height={0.05} patternUnits="userSpaceOnUse">
            <rect width={0.05} height={0.05} fill="#fbfaf6" />
            <path d="M0 0H0.05M0 0V0.05" fill="none" stroke="#c7653f" strokeWidth={0.006} />
          </pattern>
        </defs>

        <RoofElevation building={building} facade={facade} len={len} y={y} />

        {/* Facade */}
        <polygon
          points={outlinePoints}
          fill={system ? project.renderColor : "url(#elev-blocks)"}
          className="stroke-text"
          strokeWidth={0.025 * k}
          strokeLinejoin="round"
        />
        {building.roof.type === "flat" && building.roof.parapet > 0 && (
          <rect x={-0.04} y={y(H + building.roof.parapet) - 0.08} width={len + 0.08} height={0.08} fill="#9b978f" />
        )}

        {/* Floor levels */}
        {building.floors.map((_, floor) => {
          const level = floorLevel(building, floor);
          const mid = level + (building.floors[floor] ?? 0) / 2;
          return (
            <g key={floor} pointerEvents="none">
              {floor > 0 && (
                <line
                  x1={0}
                  y1={y(level)}
                  x2={len}
                  y2={y(level)}
                  className="stroke-text-tertiary"
                  strokeWidth={0.012 * k}
                  strokeDasharray={`${0.1 * k} ${0.08 * k}`}
                  opacity={0.6}
                />
              )}
              <text
                x={-0.25 * k}
                y={y(mid)}
                fontSize={0.3 * k}
                textAnchor="end"
                dominantBaseline="middle"
                className={cn("tabular-nums", floor === state.floor ? "fill-text font-medium" : "fill-text-tertiary")}
              >
                {floorName(floor)}
              </text>
            </g>
          );
        })}

        {/* Ground */}
        <line x1={-0.6 * k} y1={y(0)} x2={len + 0.6 * k} y2={y(0)} className="stroke-text" strokeWidth={0.045 * k} />

        {surface.openings.map((opening) => {
          const z0 = floorLevel(building, opening.floor) + opening.sill;
          const x0 = opening.offset;
          const x1 = x0 + opening.width;
          const z1 = z0 + opening.height;
          return (
            <g
              key={opening.id}
              tabIndex={0}
              role="button"
              aria-label={`${opening.kind === "door" ? t.openings.door : t.openings.window}, ${floorName(opening.floor)}: ${num(opening.width)} × ${num(opening.height)} m`}
              onPointerDown={startDrag(opening)}
              onPointerMove={moveDrag(opening)}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onFocus={() => dispatch({ type: "selectFloor", floor: opening.floor })}
              onKeyDown={onKey(opening)}
              className="group cursor-grab outline-none active:cursor-grabbing"
            >
              {meshed && <CornerPieces opening={opening} x0={x0} x1={x1} y0={y(z0)} y1={y(z1)} k={k} />}
              <rect
                x={x0}
                y={y(z1)}
                width={opening.width}
                height={opening.height}
                className={cn(
                  "stroke-text transition-[fill] group-hover:stroke-brand group-focus-visible:stroke-brand",
                  opening.kind === "window" ? "fill-[#dfe7ea]" : "fill-[#6f6a63]",
                )}
                strokeWidth={0.03 * k}
              />
              {opening.kind === "window" ? (
                <>
                  <line x1={(x0 + x1) / 2} y1={y(z0)} x2={(x0 + x1) / 2} y2={y(z1)} stroke="#fff" strokeWidth={0.05} />
                  <line x1={x0} y1={y(z0)} x2={x1} y2={y(z0)} className="stroke-text" strokeWidth={0.07} />
                </>
              ) : (
                <circle cx={x1 - 0.14} cy={y(z0 + 1.05)} r={0.03 * k} fill="#e9e5dc" />
              )}
            </g>
          );
        })}

        {/* Balconies stand in front of the wall (clicks pass through to the doors behind) */}
        {surface.balconies.map((balcony) => (
          <BalconyElevation
            key={balcony.id}
            balcony={balcony}
            level={floorLevel(building, balcony.floor)}
            y={y}
            k={k}
            fill={system ? project.renderColor : "url(#elev-blocks)"}
          />
        ))}

        {/* Heights, per floor and overall, on the right */}
        {building.floors.map((h, floor) => {
          const level = floorLevel(building, floor);
          return (
            <Dimension
              key={floor}
              x1={len + 0.45 * k}
              y1={y(level + h)}
              x2={len + 0.45 * k}
              y2={y(level)}
              label={h >= 0.8 * k ? num(h) : ""}
              k={k}
              vertical
            />
          );
        })}
        <Dimension x1={len + 1.05 * k} y1={y(H)} x2={len + 1.05 * k} y2={y(0)} label={`${num(H)} m`} k={k} vertical />
        <Dimension x1={0} y1={y(0) + 0.5 * k} x2={len} y2={y(0) + 0.5 * k} label={`${num(len)} m`} k={k} />
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-caption text-text-tertiary">
        <span>{t.elevation.hint}</span>
        <span className="tabular-nums">
          {facadeName(facade)} · {num(area.total)} m²
        </span>
      </div>
    </div>
  );
}

/** A balcony seen from the front: slab edge, and a masonry railing or a metal one with balusters. */
function BalconyElevation({
  balcony,
  level,
  y,
  k,
  fill,
}: {
  balcony: Balcony;
  level: number;
  y: (z: number) => number;
  k: number;
  fill: string;
}) {
  const { offset: x0, width: w, railingHeight: h } = balcony;
  const metal = balcony.railing === "metal";
  const bars = metal ? Math.max(Math.floor(w / 0.12), 2) : 0;
  return (
    <g pointerEvents="none">
      {metal ? (
        <g stroke="#4a4844">
          <line x1={x0} y1={y(level + h)} x2={x0 + w} y2={y(level + h)} strokeWidth={0.05} />
          <line x1={x0} y1={y(level + 0.1)} x2={x0 + w} y2={y(level + 0.1)} strokeWidth={0.03} />
          {Array.from({ length: bars + 1 }, (_, i) => {
            const x = x0 + (w * i) / bars;
            return <line key={i} x1={x} y1={y(level + h)} x2={x} y2={y(level)} strokeWidth={0.018} opacity={0.85} />;
          })}
        </g>
      ) : (
        <rect x={x0} y={y(level + h)} width={w} height={h} fill={fill} className="stroke-text" strokeWidth={0.02 * k} />
      )}
      <rect x={x0} y={y(level)} width={w} height={balcony.slab} fill={fill} className="stroke-text" strokeWidth={0.02 * k} />
      {/* Shadow line under the slab */}
      <line x1={x0} y1={y(level - balcony.slab) + 0.03} x2={x0 + w} y2={y(level - balcony.slab) + 0.03} stroke="#000" strokeOpacity={0.12} strokeWidth={0.06} />
    </g>
  );
}

/**
 * Diagonal mesh pieces at the corners of an opening, at 45° across the line
 * cracks would follow. Windows get four, doors the two top corners.
 */
function CornerPieces({ opening, x0, x1, y0, y1, k }: { opening: Opening; x0: number; x1: number; y0: number; y1: number; k: number }) {
  // [corner x, corner y, direction away from the opening in SVG coordinates]
  const corners: Array<[number, number, number, number]> = [
    [x0, y1, -1, -1],
    [x1, y1, 1, -1],
    ...(opening.kind === "window"
      ? ([
          [x0, y0, -1, 1],
          [x1, y0, 1, 1],
        ] as Array<[number, number, number, number]>)
      : []),
  ];
  const w = 0.42;
  const h = 0.2;
  return (
    <g pointerEvents="none">
      {corners.map(([cx, cy, dx, dy]) => {
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        const px = cx + dx * 0.16;
        const py = cy + dy * 0.16;
        return (
          <rect
            key={`${dx}${dy}`}
            x={px - w / 2}
            y={py - h / 2}
            width={w}
            height={h}
            transform={`rotate(${angle} ${px} ${py})`}
            fill="url(#elev-mesh)"
            stroke="#c7653f"
            strokeWidth={0.01 * k}
            opacity={0.9}
          />
        );
      })}
    </g>
  );
}

/** The roof as seen from this facade (not part of the facade area). */
function RoofElevation({ building, facade, len, y }: { building: Building; facade: FacadeId; len: number; y: (z: number) => number }) {
  const H = wallHeight(building);
  const { roof } = building;
  if (roof.type === "flat") return null;
  const rise = roofRise(building);
  const slope = Math.tan((roof.pitch * Math.PI) / 180);
  const drop = EAVES * slope;
  const band = 0.22;
  let points: Array<[number, number]>;

  if (isGableEnd(building, facade)) {
    // Verge boards following the gable.
    points = [
      [-EAVES, H - drop],
      [len / 2, H + rise],
      [len + EAVES, H - drop],
      [len + EAVES, H - drop + band],
      [len / 2, H + rise + band],
      [-EAVES, H - drop + band],
    ];
  } else {
    const alongRidge = (facade === "A" || facade === "C") === ridgeAlongLength(building);
    const ridge = roof.type === "gable" ? len + 2 * EAVES : alongRidge ? Math.max(len - Math.min(building.length, building.width), 0) : 0;
    const start = roof.type === "gable" ? -EAVES : (len - ridge) / 2;
    points = [
      [-EAVES, H - drop],
      [len + EAVES, H - drop],
      [start + ridge, H + rise + band],
      [start, H + rise + band],
    ];
  }

  return (
    <polygon
      points={points.map(([s, z]) => `${s},${y(z)}`).join(" ")}
      fill={ROOF_COLOR}
      opacity={0.85}
      stroke="#7d4a3b"
      strokeWidth={0.03}
      strokeLinejoin="round"
      pointerEvents="none"
    />
  );
}
