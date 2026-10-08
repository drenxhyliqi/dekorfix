"use client";

import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { MetreField } from "./metre-field";
import { PanelSection } from "./panel-section";
import { useCopy } from "./studio-copy";
import { useStudio } from "./studio-store";
import { FACADE_IDS, facadeArea, MAX_FLOORS, wallHeight } from "../model/calculations";
import type { RoofType } from "../model/types";

const ROOF_TYPES: RoofType[] = ["gable", "hip", "flat"];

/** Footprint, floors, roof and reveals: everything that shapes the facades. */
export function BuildingPanel() {
  const { state, dispatch } = useStudio();
  const { t, num, floorName } = useCopy();
  const { project } = state;
  const { building } = project;
  const facadeTotal = FACADE_IDS.reduce((sum, id) => sum + facadeArea(project, id).total, 0);
  const count = building.floors.length;

  return (
    <PanelSection index="01" title={t.building.title}>
      <div className="grid grid-cols-2 gap-3">
        <MetreField
          label={t.building.length}
          value={building.length}
          min={3}
          step={0.1}
          onCommit={(length) => dispatch({ type: "size", patch: { length } })}
        />
        <MetreField
          label={t.building.width}
          value={building.width}
          min={3}
          step={0.1}
          onCommit={(width) => dispatch({ type: "size", patch: { width } })}
        />
      </div>

      {/* Floors */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-small font-medium text-text">{t.building.floors}</p>
          <div className="flex items-center rounded-sm border border-border-strong">
            <StepButton label={t.building.removeFloor} disabled={count <= 1} onClick={() => dispatch({ type: "floors", count: count - 1 })}>
              <Minus aria-hidden className="size-4" strokeWidth={1.75} />
            </StepButton>
            <output aria-live="polite" className="w-8 text-center text-small font-medium tabular-nums text-text">
              {count}
            </output>
            <StepButton label={t.building.addFloor} disabled={count >= MAX_FLOORS} onClick={() => dispatch({ type: "floors", count: count + 1 })}>
              <Plus aria-hidden className="size-4" strokeWidth={1.75} />
            </StepButton>
          </div>
        </div>
        {/* Top floor first, like the building. */}
        <ol className="mt-3 overflow-hidden rounded-sm border border-border">
          {[...building.floors.keys()].reverse().map((floor) => (
            <li key={floor} className="grid grid-cols-[1fr_7.5rem] items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
              <span className="flex items-center gap-2.5 text-small text-text">
                <span aria-hidden className="size-2 rounded-xs bg-border-strong" />
                {floorName(floor)}
              </span>
              <MetreField
                compact
                label={`${t.building.floorHeight}: ${floorName(floor)}`}
                hideLabel
                value={building.floors[floor] ?? 3}
                min={2.2}
                onCommit={(height) => dispatch({ type: "floorHeight", floor, height })}
              />
            </li>
          ))}
        </ol>
        <p className="mt-2 text-caption text-text-tertiary">{t.building.floorHeightNote}</p>
      </div>

      {/* Roof */}
      <div className="mt-6">
        <p className="text-small font-medium text-text">{t.building.roof}</p>
        <div role="radiogroup" aria-label={t.building.roof} className="mt-3 grid grid-cols-3 gap-1.5">
          {ROOF_TYPES.map((type) => {
            const active = building.roof.type === type;
            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => dispatch({ type: "roof", patch: { type } })}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 rounded-sm border text-caption transition-colors",
                  active ? "border-text bg-inverse text-inverse-text" : "border-border-strong text-text-secondary hover:border-text hover:text-text",
                )}
              >
                <RoofIcon type={type} />
                {t.building.roofTypes[type]}
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          {building.roof.type === "flat" ? (
            <MetreField
              compact
              label={t.building.parapet}
              value={building.roof.parapet}
              onCommit={(parapet) => dispatch({ type: "roof", patch: { parapet } })}
            />
          ) : (
            <MetreField
              compact
              label={t.building.pitch}
              value={building.roof.pitch}
              unit="°"
              digits={0}
              step={1}
              min={5}
              onCommit={(pitch) => dispatch({ type: "roof", patch: { pitch } })}
            />
          )}
        </div>
        <p className="mt-2 text-caption text-text-tertiary">{t.building.roofNotes[building.roof.type]}</p>
      </div>

      {/* Reveals */}
      <div className="mt-6">
        <MetreField
          compact
          label={t.building.reveal}
          value={project.revealDepth}
          step={0.01}
          onCommit={(depth) => dispatch({ type: "reveal", depth })}
        />
        <p className="mt-2 text-caption text-text-tertiary">{t.building.revealNote}</p>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-xs border border-border bg-border text-small">
        <Readout label={t.building.footprint} value={`${num(building.length * building.width, 1)} m²`} />
        <Readout label={t.building.wallHeight} value={`${num(wallHeight(building))} m`} />
        <Readout label={t.building.facadeArea} value={`${num(facadeTotal, 1)} m²`} />
      </dl>
    </PanelSection>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center text-text transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-muted px-3 py-2.5">
      <dt className="text-caption text-text-tertiary">{label}</dt>
      <dd className="mt-0.5 tabular-nums text-text">{value}</dd>
    </div>
  );
}

/** Small house silhouette per roof type. */
function RoofIcon({ type }: { type: RoofType }) {
  const roof = {
    gable: "M3 11 L12 4 L21 11",
    hip: "M3 11 L8 5 H16 L21 11",
    flat: "M4 8 H20",
  }[type];
  return (
    <svg aria-hidden viewBox="0 0 24 20" className="h-5 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round">
      <path d={roof} />
      <path d={type === "flat" ? "M5 8 V18 H19 V8" : "M5 10 V18 H19 V10"} />
      <path d="M10.5 18 V14 H13.5 V18" />
    </svg>
  );
}
