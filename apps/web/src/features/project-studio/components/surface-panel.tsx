"use client";

import { DoorOpen, PanelTop, Trash2 } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { getProduct } from "@/content/products";
import { cn } from "@/lib/utils";

import { MetreField } from "./metre-field";
import { PanelSection } from "./panel-section";
import { SurfaceTabs } from "./room-panel";
import { useCopy } from "./studio-copy";
import { useStudio } from "./studio-store";
import { openingIssues, surfaceArea, surfaceKind, systemFor, wallLength } from "../model/calculations";
import { finishSystems, paintColors } from "../model/systems";
import type { Opening, WallId } from "../model/types";

export function SurfacePanel() {
  const { state, dispatch } = useStudio();
  const { t, num, surfaceName } = useCopy();
  const { project, selected } = state;
  const kind = surfaceKind(selected);
  const area = surfaceArea(project, selected);
  const systemId = systemFor(project, selected);
  const options = Object.values(finishSystems).filter((s) => s.surfaces.includes(kind));
  const painted = systemId ? finishSystems[systemId]?.appearance === "paint" : false;

  return (
    <PanelSection index="02" title={t.surfaces.title}>
      <SurfaceTabs />
      <p className="mt-3 text-caption text-text-tertiary">{t.surfaces.hint}</p>

      <div className="mt-6 flex items-baseline justify-between border-b border-border pb-3">
        <p className="text-body font-medium text-text">{surfaceName(selected)}</p>
        <p className="text-small tabular-nums text-text-secondary">
          {kind === "wall"
            ? `${num(wallLength(project, selected as WallId))} × ${num(project.room.height)} m`
            : `${num(project.room.length)} × ${num(project.room.width)} m`}
        </p>
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-small">
        <div className="flex gap-2">
          <dt className="text-text-tertiary">{t.surface.net}</dt>
          <dd className="tabular-nums text-text">{num(area.net)} m²</dd>
        </div>
        {area.openings > 0 && (
          <div className="flex gap-2">
            <dt className="text-text-tertiary">{t.surface.openings}</dt>
            <dd className="tabular-nums text-text">−{num(area.openings)} m²</dd>
          </div>
        )}
      </dl>

      <fieldset className="mt-6">
        <legend className="mb-3 text-small font-medium text-text">{t.surface.system}</legend>
        <div className="space-y-2">
          {options.map((system) => (
            <SystemOption
              key={system.id}
              checked={systemId === system.id}
              name={t.systems[system.id as keyof typeof t.systems]?.name ?? system.id}
              description={t.systems[system.id as keyof typeof t.systems]?.description}
              products={system.steps.map((s) => s.productSlug)}
              onSelect={() => dispatch({ type: "system", surface: selected, systemId: system.id })}
            />
          ))}
          <SystemOption
            checked={systemId === null}
            name={t.surface.none}
            products={[]}
            onSelect={() => dispatch({ type: "system", surface: selected, systemId: null })}
          />
        </div>
      </fieldset>

      {painted && (
        <div className="mt-6">
          <p className="text-small font-medium text-text">{t.surface.paintColor}</p>
          <div role="radiogroup" aria-label={t.surface.paintColor} className="mt-3 flex flex-wrap gap-2">
            {paintColors.map((color) => (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={project.paintColor === color}
                aria-label={color}
                onClick={() => dispatch({ type: "paintColor", color })}
                style={{ backgroundColor: color }}
                className={cn(
                  "size-8 rounded-full border border-border-strong transition-shadow",
                  project.paintColor === color && "shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-text)]",
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-caption text-text-tertiary">{t.surface.paintColorNote}</p>
        </div>
      )}

      {kind === "wall" && <OpeningsEditor wall={selected as WallId} />}
    </PanelSection>
  );
}

function SystemOption({
  checked,
  name,
  description,
  products,
  onSelect,
}: {
  checked: boolean;
  name: string;
  description?: string;
  products: string[];
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-sm border p-3 transition-colors",
        checked ? "border-text bg-surface-muted" : "border-border hover:border-border-strong",
      )}
    >
      <input type="radio" name="finish-system" checked={checked} onChange={onSelect} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-inverse bg-inverse" : "border-border-strong",
        )}
      >
        {checked && <span className="size-1.5 rounded-full bg-inverse-text" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-small font-medium text-text">{name}</span>
        {description && <span className="mt-0.5 block text-caption text-text-secondary">{description}</span>}
        {products.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {products.map((slug) => {
              const product = getProduct(slug);
              return (
                <span
                  key={slug}
                  className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-background py-0.5 pl-0.5 pr-2 text-caption text-text"
                >
                  {product && (
                    <Image src={product.image} alt="" width={20} height={20} className="size-5 object-contain" />
                  )}
                  {product?.name ?? slug}
                </span>
              );
            })}
          </span>
        )}
      </span>
    </label>
  );
}

function OpeningsEditor({ wall }: { wall: WallId }) {
  const { state, dispatch } = useStudio();
  const { t } = useCopy();
  const { project } = state;
  const openings = project.walls[wall].openings;
  const length = wallLength(project, wall);
  const used = openings.reduce((sum, o) => sum + o.width, 0);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-small font-medium text-text">{t.openings.title}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <AddButton icon={<DoorOpen aria-hidden className="size-4" strokeWidth={1.5} />} disabled={used + 0.9 > length} onClick={() => dispatch({ type: "addOpening", wall, kind: "door" })}>
          {t.openings.addDoor}
        </AddButton>
        <AddButton icon={<PanelTop aria-hidden className="size-4" strokeWidth={1.5} />} disabled={used + 1.2 > length} onClick={() => dispatch({ type: "addOpening", wall, kind: "window" })}>
          {t.openings.addWindow}
        </AddButton>
      </div>
      {openings.length === 0 ? (
        <p className="mt-3 text-caption text-text-tertiary">{t.openings.empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {openings.map((opening, index) => (
            <OpeningRow key={opening.id} wall={wall} opening={opening} index={index} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AddButton({
  icon,
  disabled,
  onClick,
  children,
}: {
  icon: ReactNode;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-border-strong text-small text-text transition-colors hover:border-text hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
      {children}
    </button>
  );
}

function OpeningRow({ wall, opening, index }: { wall: WallId; opening: Opening; index: number }) {
  const { state, dispatch } = useStudio();
  const { t } = useCopy();
  const update = (patch: Partial<Opening>) => dispatch({ type: "updateOpening", wall, id: opening.id, patch });
  const overlap = openingIssues(state.project, wall, opening).includes("overlap");
  const label = `${opening.kind === "door" ? t.openings.door : t.openings.window} ${index + 1}`;

  return (
    <li className="rounded-sm border border-border p-3">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-small font-medium text-text">{label}</span>
        <button
          type="button"
          onClick={() => dispatch({ type: "removeOpening", wall, id: opening.id })}
          aria-label={`${t.openings.remove}: ${label}`}
          className="-mr-1.5 inline-flex size-8 items-center justify-center rounded-sm text-text-tertiary transition-colors hover:bg-surface-muted hover:text-danger"
        >
          <Trash2 aria-hidden className="size-4" strokeWidth={1.5} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetreField compact label={t.openings.width} value={opening.width} min={0.1} onCommit={(width) => update({ width })} />
        <MetreField compact label={t.openings.height} value={opening.height} min={0.1} onCommit={(height) => update({ height })} />
        <MetreField compact label={t.openings.offset} value={opening.offset} onCommit={(offset) => update({ offset })} />
        {opening.kind === "window" && (
          <MetreField compact label={t.openings.sill} value={opening.sill} onCommit={(sill) => update({ sill })} />
        )}
      </div>
      {overlap && <p className="mt-2 text-caption text-danger">{t.openings.overlap}</p>}
    </li>
  );
}
