"use client";

import type { KeyboardEvent } from "react";

import { useCopy } from "./studio-copy";
import { useStudio } from "./studio-store";
import { surfaceArea, WALL_IDS } from "../model/calculations";
import { WALL_THICKNESS as T, wallFrame, wallPoint } from "../model/frames";
import { finishSystems } from "../model/systems";
import type { Opening, StudioProject, SurfaceId, WallId } from "../model/types";

/** Tile size in metres for the plan/elevation patterns. */
export function tileSize(systemId: string | null): number | null {
  const appearance = systemId ? finishSystems[systemId]?.appearance : undefined;
  if (appearance === "tiles") return 0.3;
  if (appearance === "largeTiles") return 0.6;
  return null;
}

export function PlanView() {
  const { state, dispatch } = useStudio();
  const { t, num, surfaceName } = useCopy();
  const { project, selected } = state;
  const { length: L, width: W } = project.room;
  const k = Math.max(L, W) / 6; // scales text and markers with the room
  const margin = 0.35 + 0.6 * k;
  const viewBox = `${-T - margin} ${-T - margin} ${L + 2 * T + 2 * margin} ${W + 2 * T + 2 * margin}`;
  const floorTile = tileSize(project.floor.systemId);
  const select = (surface: SurfaceId) => dispatch({ type: "select", surface });
  const onKey = (surface: SurfaceId) => (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(surface);
    }
  };

  return (
    <svg viewBox={viewBox} role="group" aria-label={t.plan.label} className="h-full w-full select-none" preserveAspectRatio="xMidYMid meet">
      <defs>
        {floorTile && (
          <pattern id="plan-floor-tiles" width={floorTile} height={floorTile} patternUnits="userSpaceOnUse">
            <rect width={floorTile} height={floorTile} className="fill-surface" />
            <path d={`M${floorTile} 0V${floorTile}H0`} fill="none" className="stroke-border-strong" strokeWidth={0.008} />
          </pattern>
        )}
        <pattern id="plan-hatch" width={0.12 * k} height={0.12 * k} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2={0.12 * k} className="stroke-brand" strokeWidth={0.012 * k} opacity="0.35" />
        </pattern>
      </defs>

      {/* Floor */}
      <rect
        x={0}
        y={0}
        width={L}
        height={W}
        tabIndex={0}
        role="button"
        aria-label={surfaceName("floor")}
        aria-pressed={selected === "floor"}
        onClick={() => select("floor")}
        onKeyDown={onKey("floor")}
        fill={floorTile ? "url(#plan-floor-tiles)" : undefined}
        className="cursor-pointer fill-surface outline-none transition-[fill] hover:fill-surface-muted focus-visible:stroke-focus"
        strokeWidth={0.03 * k}
      />
      {selected === "ceiling" && <rect x={0} y={0} width={L} height={W} fill="url(#plan-hatch)" pointerEvents="none" />}
      {(selected === "floor" || selected === "ceiling") && (
        <rect
          x={0.04 * k}
          y={0.04 * k}
          width={L - 0.08 * k}
          height={W - 0.08 * k}
          fill="none"
          className="stroke-brand"
          strokeWidth={0.03 * k}
          strokeDasharray={`${0.12 * k} ${0.08 * k}`}
          pointerEvents="none"
        />
      )}

      {/* Walls */}
      {WALL_IDS.map((wall) => (
        <PlanWall
          key={wall}
          project={project}
          wall={wall}
          k={k}
          selected={selected === wall}
          label={surfaceName(wall)}
          onSelect={() => select(wall)}
          onKey={onKey(wall)}
        />
      ))}

      {/* Overall dimensions */}
      <Dimension x1={0} y1={-T - 0.45 * k} x2={L} y2={-T - 0.45 * k} label={`${num(L)} m`} k={k} />
      <Dimension x1={L + T + 0.45 * k} y1={0} x2={L + T + 0.45 * k} y2={W} label={`${num(W)} m`} k={k} vertical />

      {/* Area label */}
      <g pointerEvents="none" textAnchor="middle">
        <text x={L / 2} y={W / 2 - 0.02 * k} fontSize={0.3 * k} className="fill-text font-medium tabular-nums">
          {num(surfaceArea(project, "floor").net)} m²
        </text>
        <text x={L / 2} y={W / 2 + 0.3 * k} fontSize={0.17 * k} className="fill-text-tertiary tabular-nums">
          {num(L)} × {num(W)} m
        </text>
      </g>
    </svg>
  );
}

function PlanWall({
  project,
  wall,
  k,
  selected,
  label,
  onSelect,
  onKey,
}: {
  project: StudioProject;
  wall: WallId;
  k: number;
  selected: boolean;
  label: string;
  onSelect: () => void;
  onKey: (event: KeyboardEvent) => void;
}) {
  const frame = wallFrame(project, wall);
  // A and C run past the corners so the outline closes.
  const ext = wall === "A" || wall === "C" ? T : 0;
  const corners = [wallPoint(frame, -ext, 0), wallPoint(frame, frame.length + ext, 0), wallPoint(frame, frame.length + ext, T), wallPoint(frame, -ext, T)];
  const tag = wallPoint(frame, frame.length / 2, T / 2);

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={onKey}
      className="group cursor-pointer outline-none"
    >
      <polygon
        points={corners.map((p) => `${p.x},${p.y}`).join(" ")}
        className={selected ? "fill-brand" : "fill-text transition-[fill] group-hover:fill-text-secondary group-focus-visible:fill-text-secondary"}
      />
      {project.walls[wall].openings.map((opening) => (
        <PlanOpening key={opening.id} frame={frame} opening={opening} k={k} />
      ))}
      <circle cx={tag.x} cy={tag.y} r={0.25 * k} className={selected ? "fill-brand stroke-background" : "fill-background stroke-text"} strokeWidth={0.02 * k} />
      <text x={tag.x} y={tag.y + 0.08 * k} fontSize={0.22 * k} textAnchor="middle" className={selected ? "fill-white font-medium" : "fill-text font-medium"}>
        {wall}
      </text>
    </g>
  );
}

function PlanOpening({ frame, opening, k }: { frame: ReturnType<typeof wallFrame>; opening: Opening; k: number }) {
  const a = opening.offset;
  const b = opening.offset + opening.width;
  const gap = [wallPoint(frame, a, -0.005), wallPoint(frame, b, -0.005), wallPoint(frame, b, T + 0.005), wallPoint(frame, a, T + 0.005)];
  const line = (depth: number) => {
    const p = wallPoint(frame, a, depth);
    const q = wallPoint(frame, b, depth);
    return <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="stroke-text" strokeWidth={0.015 * k} />;
  };

  if (opening.kind === "window") {
    return (
      <g pointerEvents="none">
        <polygon points={gap.map((p) => `${p.x},${p.y}`).join(" ")} className="fill-background" />
        {line(0)}
        {line(T * 0.5)}
        {line(T)}
      </g>
    );
  }

  // Door: leaf hinged at the left end, swinging into the room.
  const hinge = wallPoint(frame, a, 0);
  const end = wallPoint(frame, b, 0);
  const open = { x: hinge.x + frame.inward.x * opening.width, y: hinge.y + frame.inward.y * opening.width };
  const cross = frame.along.x * frame.inward.y - frame.along.y * frame.inward.x;
  return (
    <g pointerEvents="none">
      <polygon points={gap.map((p) => `${p.x},${p.y}`).join(" ")} className="fill-background" />
      <line x1={hinge.x} y1={hinge.y} x2={open.x} y2={open.y} className="stroke-text" strokeWidth={0.025 * k} />
      <path
        d={`M${end.x} ${end.y} A${opening.width} ${opening.width} 0 0 ${cross > 0 ? 1 : 0} ${open.x} ${open.y}`}
        fill="none"
        className="stroke-text-tertiary"
        strokeWidth={0.012 * k}
        strokeDasharray={`${0.05 * k} ${0.04 * k}`}
      />
    </g>
  );
}

export function Dimension({
  x1,
  y1,
  x2,
  y2,
  label,
  k,
  vertical,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  k: number;
  vertical?: boolean;
}) {
  const tick = 0.09 * k;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <g pointerEvents="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-text-tertiary" strokeWidth={0.012 * k} />
      {[
        [x1, y1],
        [x2, y2],
      ].map(([x, y]) => (
        <line key={`${x}-${y}`} x1={(x ?? 0) - tick} y1={(y ?? 0) + tick} x2={(x ?? 0) + tick} y2={(y ?? 0) - tick} className="stroke-brand" strokeWidth={0.02 * k} />
      ))}
      <text
        x={vertical ? midX + 0.2 * k : midX}
        y={vertical ? midY : midY - 0.13 * k}
        fontSize={0.2 * k}
        textAnchor="middle"
        transform={vertical ? `rotate(90 ${midX + 0.2 * k} ${midY})` : undefined}
        className="fill-text-secondary tabular-nums"
      >
        {label}
      </text>
    </g>
  );
}
