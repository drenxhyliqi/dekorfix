"use client";

import { MetreField } from "./metre-field";
import { PanelSection } from "./panel-section";
import { useCopy } from "./studio-copy";
import { useStudio } from "./studio-store";
import { SURFACE_IDS, surfaceArea, WALL_IDS } from "../model/calculations";
import type { SurfaceId } from "../model/types";

export function RoomPanel() {
  const { state, dispatch } = useStudio();
  const { t, num } = useCopy();
  const { room } = state.project;
  const wallArea = WALL_IDS.reduce((sum, id) => sum + surfaceArea(state.project, id).net, 0);

  return (
    <PanelSection index="01" title={t.room.title}>
      <div className="grid grid-cols-2 gap-3">
        <MetreField label={t.room.length} value={room.length} min={1} onCommit={(length) => dispatch({ type: "room", patch: { length } })} />
        <MetreField label={t.room.width} value={room.width} min={1} onCommit={(width) => dispatch({ type: "room", patch: { width } })} />
        <MetreField
          label={t.room.height}
          value={room.height}
          min={2}
          className="col-span-2"
          onCommit={(height) => dispatch({ type: "room", patch: { height } })}
        />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xs border border-border bg-border text-small">
        <Readout label={t.room.floorArea} value={`${num(room.length * room.width)} m²`} />
        <Readout label={t.room.wallArea} value={`${num(wallArea)} m²`} />
      </dl>
    </PanelSection>
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

/** Segmented control for choosing which surface to edit. */
export function SurfaceTabs() {
  const { state, dispatch } = useStudio();
  const { surfaceName } = useCopy();
  return (
    <div role="radiogroup" className="grid grid-cols-3 gap-1.5">
      {SURFACE_IDS.map((id: SurfaceId) => {
        const active = state.selected === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => dispatch({ type: "select", surface: id })}
            className={
              active
                ? "h-9 rounded-sm border border-text bg-inverse text-small font-medium text-inverse-text"
                : "h-9 rounded-sm border border-border-strong text-small text-text-secondary transition-colors hover:border-text hover:text-text"
            }
          >
            {surfaceName(id)}
          </button>
        );
      })}
    </div>
  );
}
