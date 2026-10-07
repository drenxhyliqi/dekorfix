"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

import { Dimension, tileSize } from "./plan-view";
import { useCopy } from "./studio-copy";
import { useStudio } from "./studio-store";
import { surfaceArea, wallLength } from "../model/calculations";
import type { Opening, WallId } from "../model/types";

const SNAP = 0.05;
const snap = (value: number) => Math.round(value / SNAP) * SNAP;

/** Elevation of the selected wall, seen from inside the room. Openings can be dragged. */
export function ElevationView() {
  const { state, dispatch } = useStudio();
  const { t, num, surfaceName } = useCopy();
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; x: number; y: number; offset: number; sill: number } | null>(null);

  const wall = (state.selected === "floor" || state.selected === "ceiling" ? "A" : state.selected) as WallId;
  const { project } = state;
  const len = wallLength(project, wall);
  const H = project.room.height;
  const surface = project.walls[wall];
  const k = Math.max(len, H) / 6;
  const margin = 0.3 + 0.7 * k;
  const tile = tileSize(surface.systemId);
  const painted = surface.systemId !== null && !tile;
  const area = surfaceArea(project, wall);
  // SVG y grows downwards; heights are measured up from the floor.
  const y = (z: number) => H - z;

  const toMetres = (event: PointerEvent) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
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
      wall,
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
      ...(opening.kind === "window"
        ? { ArrowUp: { sill: opening.sill + step }, ArrowDown: { sill: opening.sill - step } }
        : {}),
    };
    const patch = moves[event.key];
    if (!patch) return;
    event.preventDefault();
    dispatch({ type: "updateOpening", wall, id: opening.id, patch });
  };

  // Dimension chain along the floor: wall ends and opening edges.
  const stops = [0, ...surface.openings.flatMap((o) => [o.offset, o.offset + o.width]), len]
    .sort((a, b) => a - b)
    .filter((value, index, all) => index === 0 || value - (all[index - 1] ?? 0) > 0.001);

  return (
    <div className="flex h-full flex-col">
      <svg
        ref={svgRef}
        viewBox={`${-margin} ${-margin * 0.7} ${len + 2 * margin} ${H + margin * 1.9}`}
        role="group"
        aria-label={`${t.elevation.label} ${surfaceName(wall)}`}
        className="min-h-0 w-full flex-1 touch-none select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {tile && (
            <pattern id="elevation-tiles" width={tile} height={tile} patternUnits="userSpaceOnUse" y={H % tile}>
              <rect width={tile} height={tile} className="fill-surface" />
              <path d={`M${tile} 0V${tile}H0`} fill="none" className="stroke-border-strong" strokeWidth={0.008} />
            </pattern>
          )}
        </defs>

        {/* Wall */}
        <rect
          x={0}
          y={0}
          width={len}
          height={H}
          fill={tile ? "url(#elevation-tiles)" : painted ? project.paintColor : undefined}
          className={cn(!tile && !painted && "fill-surface-strong", "stroke-text")}
          strokeWidth={0.02 * k}
        />
        <line x1={-0.3 * k} y1={H} x2={len + 0.3 * k} y2={H} className="stroke-text" strokeWidth={0.04 * k} />

        {surface.openings.map((opening) => (
          <g
            key={opening.id}
            tabIndex={0}
            role="button"
            aria-label={`${opening.kind === "door" ? t.openings.door : t.openings.window} ${num(opening.width)} × ${num(opening.height)} m`}
            onPointerDown={startDrag(opening)}
            onPointerMove={moveDrag(opening)}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKey(opening)}
            className="group cursor-grab outline-none active:cursor-grabbing"
          >
            <rect
              x={opening.offset}
              y={y(opening.sill + opening.height)}
              width={opening.width}
              height={opening.height}
              className={cn(
                "stroke-text transition-[fill] group-hover:stroke-brand group-focus-visible:stroke-brand",
                opening.kind === "window" ? "fill-background" : "fill-surface-strong",
              )}
              strokeWidth={0.025 * k}
            />
            {opening.kind === "window" ? (
              <>
                <line x1={opening.offset + opening.width / 2} y1={y(opening.sill)} x2={opening.offset + opening.width / 2} y2={y(opening.sill + opening.height)} className="stroke-text" strokeWidth={0.015 * k} />
                <line x1={opening.offset} y1={y(opening.sill + opening.height * 0.7)} x2={opening.offset + opening.width} y2={y(opening.sill + opening.height * 0.7)} className="stroke-text" strokeWidth={0.015 * k} />
              </>
            ) : (
              <>
                <rect x={opening.offset + 0.05} y={y(opening.height - 0.05)} width={opening.width - 0.1} height={opening.height - 0.05} fill="none" className="stroke-text-tertiary" strokeWidth={0.012 * k} />
                <circle cx={opening.offset + opening.width - 0.14} cy={y(1.05)} r={0.035 * k} className="fill-text" />
              </>
            )}
            <text
              x={opening.offset + opening.width / 2}
              y={y(opening.sill + opening.height) - 0.1 * k}
              fontSize={0.17 * k}
              textAnchor="middle"
              className="pointer-events-none fill-text-secondary tabular-nums"
            >
              {num(opening.width)} × {num(opening.height)}
            </text>
          </g>
        ))}

        {/* Height and dimension chain */}
        <Dimension x1={-0.4 * k} y1={0} x2={-0.4 * k} y2={H} label={`${num(H)} m`} k={k} vertical />
        {stops.slice(1).map((stop, index) => {
          const start = stops[index] ?? 0;
          return (
            <Dimension
              key={`${start}-${stop}`}
              x1={start}
              y1={H + 0.45 * k}
              x2={stop}
              y2={H + 0.45 * k}
              label={stop - start >= 0.35 * k ? num(stop - start) : ""}
              k={k}
            />
          );
        })}
        <Dimension x1={0} y1={H + 0.95 * k} x2={len} y2={H + 0.95 * k} label={`${num(len)} m`} k={k} />
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-caption text-text-tertiary">
        <span>{t.elevation.hint}</span>
        <span className="tabular-nums">
          {surfaceName(wall)} · {num(area.net)} m²
        </span>
      </div>
    </div>
  );
}
