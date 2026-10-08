"use client";

import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

import { useCopy } from "./studio-copy";
import { useStudio } from "./studio-store";
import { FACADE_IDS, ridgeAlongLength } from "../model/calculations";
import { WALL_THICKNESS as T, facadeFrame, facadePoint, type FacadeFrame } from "../model/frames";
import { finishSystems } from "../model/systems";
import type { Balcony, FacadeId, Opening, StudioProject } from "../model/types";

const pts = (points: Array<{ x: number; y: number }>) => points.map((p) => `${p.x},${p.y}`).join(" ");

/** Plan of the house: walls, insulation, roof lines and the openings of the active floor. */
export function PlanView() {
  const { state, dispatch } = useStudio();
  const { t, num, facadeName, floorName } = useCopy();
  const { project, selected, floor } = state;
  const { length: L, width: W } = project.building;
  const k = Math.max(L, W) / 10; // scales text and markers with the house
  // Balconies push the labels and dimensions outwards.
  const reach = (facade: FacadeId) => Math.max(0, ...project.facades[facade].balconies.map((b) => b.depth + 0.2));
  const margin = 1.2 * k + 0.6 + Math.max(...FACADE_IDS.map(reach));
  const viewBox = `${-margin} ${-margin} ${L + 2 * margin} ${W + 2 * margin}`;
  const select = (facade: FacadeId) => dispatch({ type: "select", facade });
  const onKey = (facade: FacadeId) => (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(facade);
    }
  };

  return (
    <svg viewBox={viewBox} role="group" aria-label={t.plan.label} className="h-full w-full select-none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="plan-eps" width={0.08 * k} height={0.08 * k} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={0.08 * k} height={0.08 * k} fill="#f4f2ec" />
          <line x1="0" y1="0" x2="0" y2={0.08 * k} stroke="#c9c4b8" strokeWidth={0.012 * k} />
        </pattern>
      </defs>

      {/* Inside of the house */}
      <rect x={T} y={T} width={L - 2 * T} height={W - 2 * T} className="fill-surface" />
      <RoofLines project={project} k={k} />

      {FACADE_IDS.map((facade) => (
        <PlanFacade
          key={facade}
          project={project}
          facade={facade}
          floor={floor}
          k={k}
          selected={selected === facade}
          label={facadeName(facade)}
          onSelect={() => select(facade)}
          onKey={onKey(facade)}
        />
      ))}

      {/* Overall dimensions, beyond the back and the right side */}
      <Dimension x1={0} y1={-0.95 * k - 0.35 - reach("C")} x2={L} y2={-0.95 * k - 0.35 - reach("C")} label={`${num(L)} m`} k={k} />
      <Dimension
        x1={L + 0.95 * k + 0.35 + reach("B")}
        y1={0}
        x2={L + 0.95 * k + 0.35 + reach("B")}
        y2={W}
        label={`${num(W)} m`}
        k={k}
        vertical
      />

      <g pointerEvents="none" textAnchor="middle">
        <text x={L / 2} y={W / 2 - 0.05 * k} fontSize={0.42 * k} className="fill-text font-medium tabular-nums">
          {num(L * W, 1)} m²
        </text>
        <text x={L / 2} y={W / 2 + 0.42 * k} fontSize={0.24 * k} className="fill-text-tertiary">
          {t.plan.showing}: {floorName(floor)}
        </text>
      </g>
    </svg>
  );
}

/** Ridge and hip lines, dashed, as seen from above. */
function RoofLines({ project, k }: { project: StudioProject; k: number }) {
  const { length: L, width: W, roof } = project.building;
  if (roof.type === "flat") return null;
  const alongLength = ridgeAlongLength(project.building);
  const half = Math.min(L, W) / 2;
  const ridge = alongLength
    ? { x1: roof.type === "hip" ? half : 0, y1: W / 2, x2: roof.type === "hip" ? L - half : L, y2: W / 2 }
    : { x1: L / 2, y1: roof.type === "hip" ? half : 0, x2: L / 2, y2: roof.type === "hip" ? W - half : W };
  const style = { strokeWidth: 0.018 * k, strokeDasharray: `${0.12 * k} ${0.08 * k}` };
  return (
    <g pointerEvents="none" className="stroke-border-strong" fill="none">
      <line {...ridge} {...style} />
      {roof.type === "hip" && (
        <>
          <line x1={0} y1={0} x2={ridge.x1} y2={ridge.y1} {...style} />
          <line x1={0} y1={W} x2={ridge.x1} y2={ridge.y1} {...style} />
          <line x1={L} y1={0} x2={ridge.x2} y2={ridge.y2} {...style} />
          <line x1={L} y1={W} x2={ridge.x2} y2={ridge.y2} {...style} />
        </>
      )}
    </g>
  );
}

function PlanFacade({
  project,
  facade,
  floor,
  k,
  selected,
  label,
  onSelect,
  onKey,
}: {
  project: StudioProject;
  facade: FacadeId;
  floor: number;
  k: number;
  selected: boolean;
  label: string;
  onSelect: () => void;
  onKey: (event: KeyboardEvent) => void;
}) {
  const frame = facadeFrame(project.building, facade);
  const len = frame.length;
  const state = project.facades[facade];
  const system = state.systemId ? finishSystems[state.systemId] : undefined;
  // Mitred wall strip on the outer face; insulation drawn outside it (slightly exaggerated to stay visible).
  const wall = [facadePoint(frame, 0, 0), facadePoint(frame, len, 0), facadePoint(frame, len - T, -T), facadePoint(frame, T, -T)];
  const d = system?.insulation ? Math.max(project.insulationCm / 100, 0.06 * k) : 0;
  const eps = [facadePoint(frame, 0, 0), facadePoint(frame, len, 0), facadePoint(frame, len + d, d), facadePoint(frame, -d, d)];
  const balconyReach = Math.max(0, ...state.balconies.map((b) => b.depth + 0.2));
  const tagAt = facadePoint(frame, len / 2, 0.55 * k + d + balconyReach);
  const finish = [facadePoint(frame, -d, d), facadePoint(frame, len + d, d)];

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
      {d > 0 && <polygon points={pts(eps)} fill="url(#plan-eps)" />}
      {state.balconies.map((balcony) => (
        <PlanBalcony key={balcony.id} frame={frame} balcony={balcony} from={d} k={k} current={balcony.floor === floor} />
      ))}
      {system && (
        <line
          x1={finish[0]?.x}
          y1={finish[0]?.y}
          x2={finish[1]?.x}
          y2={finish[1]?.y}
          stroke={selected ? "var(--color-brand)" : project.renderColor}
          strokeWidth={0.05 * k}
          className={selected ? undefined : "[filter:brightness(0.85)]"}
        />
      )}
      <polygon
        points={pts(wall)}
        className={cn(selected ? "fill-brand" : "fill-text transition-[fill] group-hover:fill-text-secondary group-focus-visible:fill-text-secondary")}
      />
      {state.openings
        .filter((o) => o.floor === floor)
        .map((opening) => (
          <PlanOpening key={opening.id} frame={frame} opening={opening} k={k} />
        ))}
      <g transform={`translate(${tagAt.x} ${tagAt.y})`}>
        <rect
          x={-0.24 * k}
          y={-0.24 * k}
          width={0.48 * k}
          height={0.48 * k}
          rx={0.04 * k}
          className={selected ? "fill-brand" : "fill-background stroke-text"}
          strokeWidth={0.02 * k}
        />
        <text y={0.09 * k} fontSize={0.26 * k} textAnchor="middle" className={selected ? "fill-white font-semibold" : "fill-text font-semibold"}>
          {facade}
        </text>
      </g>
    </g>
  );
}

/** Balcony outline outside the facade: solid on the floor shown, faint on the others. */
function PlanBalcony({ frame, balcony, from, k, current }: { frame: FacadeFrame; balcony: Balcony; from: number; k: number; current: boolean }) {
  const a = balcony.offset;
  const b = balcony.offset + balcony.width;
  const out = from + balcony.depth;
  const slab = [facadePoint(frame, a, from), facadePoint(frame, b, from), facadePoint(frame, b, out), facadePoint(frame, a, out)];
  return (
    <polygon
      points={pts(slab)}
      fill={current ? "#efece5" : "none"}
      className="stroke-text"
      strokeWidth={(current && balcony.railing === "solid" ? 0.05 : 0.018) * k}
      strokeDasharray={current ? undefined : `${0.08 * k} ${0.06 * k}`}
      opacity={current ? 1 : 0.45}
      strokeLinejoin="round"
    />
  );
}

function PlanOpening({ frame, opening, k }: { frame: FacadeFrame; opening: Opening; k: number }) {
  const a = opening.offset;
  const b = opening.offset + opening.width;
  const gap = [facadePoint(frame, a, 0.005), facadePoint(frame, b, 0.005), facadePoint(frame, b, -T - 0.005), facadePoint(frame, a, -T - 0.005)];
  const line = (depth: number) => {
    const p = facadePoint(frame, a, depth);
    const q = facadePoint(frame, b, depth);
    return <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="stroke-text" strokeWidth={0.02 * k} />;
  };

  if (opening.kind === "window") {
    return (
      <g pointerEvents="none">
        <polygon points={pts(gap)} className="fill-background" />
        {line(0)}
        {line(-T / 2)}
        {line(-T)}
      </g>
    );
  }

  // Door: leaf hinged at the left end, swinging into the house.
  const hinge = facadePoint(frame, a, -T);
  const end = facadePoint(frame, b, -T);
  const open = facadePoint(frame, a, -T - opening.width);
  const cross = frame.along.x * -frame.outward.y - frame.along.y * -frame.outward.x;
  return (
    <g pointerEvents="none">
      <polygon points={pts(gap)} className="fill-background" />
      <line x1={hinge.x} y1={hinge.y} x2={open.x} y2={open.y} className="stroke-text" strokeWidth={0.03 * k} />
      <path
        d={`M${end.x} ${end.y} A${opening.width} ${opening.width} 0 0 ${cross > 0 ? 1 : 0} ${open.x} ${open.y}`}
        fill="none"
        className="stroke-text-tertiary"
        strokeWidth={0.015 * k}
        strokeDasharray={`${0.06 * k} ${0.05 * k}`}
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
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-text-tertiary" strokeWidth={0.014 * k} />
      {[
        [x1, y1],
        [x2, y2],
      ].map(([x, y]) => (
        <line key={`${x}-${y}`} x1={(x ?? 0) - tick} y1={(y ?? 0) + tick} x2={(x ?? 0) + tick} y2={(y ?? 0) - tick} className="stroke-brand" strokeWidth={0.022 * k} />
      ))}
      <text
        x={vertical ? midX + 0.22 * k : midX}
        y={vertical ? midY : midY - 0.14 * k}
        fontSize={0.22 * k}
        textAnchor="middle"
        transform={vertical ? `rotate(90 ${midX + 0.22 * k} ${midY})` : undefined}
        className="fill-text-secondary tabular-nums"
      >
        {label}
      </text>
    </g>
  );
}
