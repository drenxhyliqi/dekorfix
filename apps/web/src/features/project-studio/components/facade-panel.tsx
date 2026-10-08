"use client";

import { Check, Copy, DoorOpen, Fence, Layers, PanelTop, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { getProduct } from "@/content/products";
import { cn } from "@/lib/utils";

import { MetreField } from "./metre-field";
import { PanelSection } from "./panel-section";
import { useCopy } from "./studio-copy";
import { useStudio } from "./studio-store";
import {
  FACADE_IDS,
  balconyArea,
  balconyIssues,
  effectiveSteps,
  facadeArea,
  facadeLength,
  hasMesh,
  isGableEnd,
  openingIssues,
} from "../model/calculations";
import { finishSystems, renderColors } from "../model/systems";
import type { Balcony, FacadeId, Opening } from "../model/types";

/** Segmented control for choosing which facade to edit. */
export function FacadeTabs() {
  const { state, dispatch } = useStudio();
  const { facadeName } = useCopy();
  return (
    <div role="radiogroup" className="grid grid-cols-2 gap-1.5">
      {FACADE_IDS.map((id) => {
        const active = state.selected === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => dispatch({ type: "select", facade: id })}
            className={cn(
              "flex h-10 items-center gap-2 rounded-sm border px-3 text-small transition-colors",
              active
                ? "border-text bg-inverse font-medium text-inverse-text"
                : "border-border-strong text-text-secondary hover:border-text hover:text-text",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "inline-flex size-5 items-center justify-center rounded-xs text-[0.6875rem] font-semibold",
                active ? "bg-brand text-white" : "bg-surface-muted text-text",
              )}
            >
              {id}
            </span>
            {facadeName(id)}
          </button>
        );
      })}
    </div>
  );
}

export function FacadePanel() {
  const { state, dispatch } = useStudio();
  const { t, num, facadeName } = useCopy();
  const { project, selected } = state;
  const facade = project.facades[selected];
  const area = facadeArea(project, selected);
  const system = facade.systemId ? finishSystems[facade.systemId] : undefined;
  const { roof } = project.building;
  const extra = isGableEnd(project.building, selected) ? t.facade.gable : roof.type === "flat" && roof.parapet > 0 ? t.facade.parapet : null;

  return (
    <PanelSection index="02" title={t.facades.title}>
      <FacadeTabs />
      <p className="mt-3 text-caption text-text-tertiary">{t.facades.hint}</p>

      <div className="mt-6 flex items-baseline justify-between gap-3 border-b border-border pb-3">
        <p className="text-body font-medium text-text">{facadeName(selected)}</p>
        <p className="text-small tabular-nums text-text-secondary">
          {num(facadeLength(project.building, selected))} m{extra && ` · ${extra}`}
        </p>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-small">
        <AreaRow label={t.facade.gross} value={`${num(area.gross)} m²`} />
        {area.openings > 0 && <AreaRow label={t.facade.openings} value={`−${num(area.openings)} m²`} />}
        {area.reveals > 0 && <AreaRow label={t.facade.reveals} value={`+${num(area.reveals)} m²`} />}
        {area.balconies > 0 && <AreaRow label={t.facade.balconies} value={`+${num(area.balconies)} m²`} />}
        <AreaRow label={t.facade.total} value={`${num(area.total)} m²`} strong />
      </dl>

      <fieldset className="mt-6">
        <legend className="mb-3 text-small font-medium text-text">{t.facade.system}</legend>
        <div className="space-y-2">
          {Object.values(finishSystems).map((option) => {
            const copy = t.systems[option.id as keyof typeof t.systems];
            return (
              <SystemOption
                key={option.id}
                checked={facade.systemId === option.id}
                name={copy?.name ?? option.id}
                description={copy?.description}
                products={effectiveSteps(option, facade.systemId === option.id && facade.mesh).map((s) => s.productSlug)}
                onSelect={() => dispatch({ type: "system", facade: selected, systemId: option.id })}
              />
            );
          })}
          <SystemOption
            checked={facade.systemId === null}
            name={t.facade.none}
            products={[]}
            onSelect={() => dispatch({ type: "system", facade: selected, systemId: null })}
          />
        </div>
      </fieldset>

      {system && (
        <>
          <MeshOption
            included={system.mesh === "included"}
            checked={hasMesh(system, facade.mesh)}
            onChange={(on) => dispatch({ type: "mesh", facade: selected, on })}
          />

          {system.insulation && (
            <div className="mt-4">
              <MetreField
                compact
                label={t.facade.insulation}
                value={project.insulationCm}
                unit="cm"
                digits={0}
                step={1}
                min={2}
                onCommit={(cm) => dispatch({ type: "insulation", cm })}
              />
            </div>
          )}

          <div className="mt-6">
            <p className="text-small font-medium text-text">{t.facade.color}</p>
            <div role="radiogroup" aria-label={t.facade.color} className="mt-3 flex flex-wrap gap-2">
              {renderColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={project.renderColor === color}
                  aria-label={color}
                  onClick={() => dispatch({ type: "renderColor", color })}
                  style={{ backgroundColor: color }}
                  className={cn(
                    "size-8 rounded-sm border border-border-strong transition-shadow",
                    project.renderColor === color && "shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-text)]",
                  )}
                />
              ))}
            </div>
            <p className="mt-2 text-caption text-text-tertiary">{t.facade.colorNote}</p>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => dispatch({ type: "applyToAll", facade: selected })}
        className="mt-6 inline-flex h-9 w-full items-center justify-center gap-2 rounded-sm border border-border-strong text-small text-text transition-colors hover:border-text hover:bg-surface-muted"
      >
        <Copy aria-hidden className="size-4" strokeWidth={1.5} />
        {t.facade.applyAll}
      </button>

      <OpeningsEditor facade={selected} />
    </PanelSection>
  );
}

function AreaRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className={cn("tabular-nums", strong ? "font-medium text-text" : "text-text-secondary")}>{value}</dd>
    </div>
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
        "flex cursor-pointer gap-3 rounded-sm border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
        checked ? "border-text bg-surface-muted" : "border-border hover:border-border-strong",
      )}
    >
      <input type="radio" name="finish-system" checked={checked} onChange={onSelect} className="sr-only" />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-xs border",
          checked ? "border-inverse bg-inverse" : "border-border-strong",
        )}
      >
        {checked && <Check className="size-3 text-inverse-text" strokeWidth={3} />}
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
                  {product && <Image src={product.image} alt="" width={20} height={20} className="size-5 object-contain" />}
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

/** Reinforcing mesh (rrjetë): a switch, or a locked "included" state for systems that always have it. */
function MeshOption({ included, checked, onChange }: { included: boolean; checked: boolean; onChange: (on: boolean) => void }) {
  const { t } = useCopy();
  return (
    <label
      className={cn(
        "mt-4 flex gap-3 rounded-sm border p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
        checked ? "border-brand/40 bg-brand/[0.04]" : "border-border",
        included ? "cursor-default" : "cursor-pointer hover:border-border-strong",
      )}
    >
      <span aria-hidden className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xs bg-surface-muted text-text">
        <MeshGlyph />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-small font-medium text-text">{t.mesh.title}</span>
        <span className="mt-0.5 block text-caption text-text-secondary">
          {included ? t.mesh.included : t.mesh.description}
        </span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={included}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      {/* Squared switch */}
      <span
        aria-hidden
        className={cn(
          "relative mt-1 h-5 w-9 shrink-0 rounded-xs border transition-colors",
          checked ? "border-brand bg-brand" : "border-border-strong bg-surface-muted",
          included && "opacity-60",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-3.5 rounded-[1px] bg-white shadow-sm transition-[left] duration-200",
            checked ? "left-[1.1rem]" : "left-0.5",
          )}
        />
      </span>
    </label>
  );
}

function MeshGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.1}>
      {[4, 8, 12, 16].map((v) => (
        <g key={v}>
          <path d={`M${v} 2 V18`} />
          <path d={`M2 ${v} H18`} />
        </g>
      ))}
    </svg>
  );
}

function OpeningsEditor({ facade }: { facade: FacadeId }) {
  const { state, dispatch } = useStudio();
  const { t, floorName } = useCopy();
  const { project, floor } = state;
  const all = project.facades[facade].openings;
  const openings = all.filter((o) => o.floor === floor);
  const length = facadeLength(project.building, facade);
  const used = openings.reduce((sum, o) => sum + o.width, 0);
  const floors = project.building.floors.length;

  return (
    <div className="mt-8">
      <p className="text-small font-medium text-text">{t.openings.title}</p>

      {floors > 1 && (
        <div role="tablist" aria-label={t.building.floors} className="mt-3 flex flex-wrap gap-1.5">
          {project.building.floors.map((_, index) => {
            const active = index === floor;
            const countOnFloor =
              all.filter((o) => o.floor === index).length +
              project.facades[facade].balconies.filter((b) => b.floor === index).length;
            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => dispatch({ type: "selectFloor", floor: index })}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-sm border px-2.5 text-caption transition-colors",
                  active ? "border-text bg-surface-muted font-medium text-text" : "border-border text-text-secondary hover:border-border-strong hover:text-text",
                )}
              >
                {floorName(index)}
                <span className="tabular-nums text-text-tertiary">{countOnFloor}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <AddButton
          icon={<PanelTop aria-hidden className="size-4" strokeWidth={1.5} />}
          disabled={used + 1.2 > length}
          onClick={() => dispatch({ type: "addOpening", facade, floor, kind: "window" })}
        >
          {t.openings.addWindow}
        </AddButton>
        <AddButton
          icon={<DoorOpen aria-hidden className="size-4" strokeWidth={1.5} />}
          disabled={used + 1 > length}
          onClick={() => dispatch({ type: "addOpening", facade, floor, kind: "door" })}
        >
          {t.openings.addDoor}
        </AddButton>
      </div>

      {openings.length === 0 ? (
        <p className="mt-3 text-caption text-text-tertiary">{t.openings.empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {openings.map((opening, index) => (
            <OpeningRow key={opening.id} facade={facade} opening={opening} index={index} />
          ))}
        </ul>
      )}

      <BalconiesEditor facade={facade} floor={floor} />

      {floors > 1 && (openings.length > 0 || project.facades[facade].balconies.some((b) => b.floor === floor)) && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t.openings.copyFloorConfirm)) dispatch({ type: "copyFloor", facade, floor });
          }}
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-border-strong text-small text-text-secondary transition-colors hover:border-text hover:text-text"
        >
          <Layers aria-hidden className="size-4" strokeWidth={1.5} />
          {t.openings.copyFloor}
        </button>
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

function OpeningRow({ facade, opening, index }: { facade: FacadeId; opening: Opening; index: number }) {
  const { state, dispatch } = useStudio();
  const { t } = useCopy();
  const update = (patch: Partial<Opening>) => dispatch({ type: "updateOpening", facade, id: opening.id, patch });
  const overlap = openingIssues(state.project, facade, opening).includes("overlap");
  const label = `${opening.kind === "door" ? t.openings.door : t.openings.window} ${index + 1}`;

  return (
    <li className="rounded-sm border border-border p-3">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-small font-medium text-text">{label}</span>
        <button
          type="button"
          onClick={() => dispatch({ type: "removeOpening", facade, id: opening.id })}
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

/** Balconies of the active floor: size, railing, and a shortcut to add the balcony door. */
function BalconiesEditor({ facade, floor }: { facade: FacadeId; floor: number }) {
  const { state, dispatch } = useStudio();
  const { t } = useCopy();
  const balconies = state.project.facades[facade].balconies.filter((b) => b.floor === floor);

  return (
    <div className="mt-5 border-t border-border pt-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-small font-medium text-text">
          <Fence aria-hidden className="size-4 text-text-tertiary" strokeWidth={1.5} />
          {t.balconies.title}
        </p>
        {floor > 0 && (
          <button
            type="button"
            onClick={() => dispatch({ type: "addBalcony", facade, floor })}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border-strong px-2.5 text-caption text-text transition-colors hover:border-text hover:bg-surface-muted"
          >
            <Plus aria-hidden className="size-3.5" strokeWidth={1.75} />
            {t.balconies.add}
          </button>
        )}
      </div>
      {floor === 0 ? (
        <p className="mt-2 text-caption text-text-tertiary">{t.balconies.groundNote}</p>
      ) : (
        balconies.length > 0 && (
          <>
            <ul className="mt-3 space-y-2">
              {balconies.map((balcony, index) => (
                <BalconyRow key={balcony.id} facade={facade} balcony={balcony} index={index} />
              ))}
            </ul>
            <p className="mt-2 text-caption text-text-tertiary">{t.balconies.note}</p>
          </>
        )
      )}
    </div>
  );
}

function BalconyRow({ facade, balcony, index }: { facade: FacadeId; balcony: Balcony; index: number }) {
  const { state, dispatch } = useStudio();
  const { t, num } = useCopy();
  const update = (patch: Partial<Balcony>) => dispatch({ type: "updateBalcony", facade, id: balcony.id, patch });
  const overlap = balconyIssues(state.project, facade, balcony).includes("overlap");
  const label = `${t.balconies.balcony} ${index + 1}`;
  // Is there already a door on this floor within the balcony's span?
  const hasDoor = state.project.facades[facade].openings.some(
    (o) => o.kind === "door" && o.floor === balcony.floor && o.offset < balcony.offset + balcony.width && balcony.offset < o.offset + o.width,
  );

  return (
    <li className="rounded-sm border border-border p-3">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-small font-medium text-text">
          {label}
          <span className="ml-2 font-normal tabular-nums text-text-tertiary">+{num(balconyArea(balcony))} m²</span>
        </span>
        <button
          type="button"
          onClick={() => dispatch({ type: "removeBalcony", facade, id: balcony.id })}
          aria-label={`${t.balconies.remove}: ${label}`}
          className="-mr-1.5 inline-flex size-8 items-center justify-center rounded-sm text-text-tertiary transition-colors hover:bg-surface-muted hover:text-danger"
        >
          <Trash2 aria-hidden className="size-4" strokeWidth={1.5} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetreField compact label={t.balconies.width} value={balcony.width} min={0.6} onCommit={(width) => update({ width })} />
        <MetreField compact label={t.balconies.depth} value={balcony.depth} min={0.3} onCommit={(depth) => update({ depth })} />
        <MetreField compact label={t.balconies.offset} value={balcony.offset} onCommit={(offset) => update({ offset })} />
        <MetreField compact label={t.balconies.slab} value={balcony.slab} min={0.1} step={0.01} onCommit={(slab) => update({ slab })} />
      </div>

      <p className="mb-1.5 mt-3 text-caption text-text-secondary">{t.balconies.railing}</p>
      <div role="radiogroup" aria-label={t.balconies.railing} className="grid grid-cols-2 gap-1.5">
        {(["metal", "solid"] as const).map((railing) => {
          const active = balcony.railing === railing;
          return (
            <button
              key={railing}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => update({ railing })}
              className={cn(
                "h-8 rounded-sm border text-caption transition-colors",
                active ? "border-text bg-surface-muted font-medium text-text" : "border-border text-text-secondary hover:border-border-strong hover:text-text",
              )}
            >
              {t.balconies.railings[railing]}
            </button>
          );
        })}
      </div>
      {balcony.railing === "solid" && (
        <div className="mt-2">
          <MetreField
            compact
            label={t.balconies.railingHeight}
            value={balcony.railingHeight}
            min={0.8}
            onCommit={(railingHeight) => update({ railingHeight })}
          />
        </div>
      )}

      {!hasDoor && (
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: "addOpening",
              facade,
              floor: balcony.floor,
              kind: "door",
              offset: balcony.offset + balcony.width / 2 - 0.5,
            })
          }
          className="mt-3 inline-flex h-8 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-border-strong text-caption text-text-secondary transition-colors hover:border-text hover:text-text"
        >
          <DoorOpen aria-hidden className="size-3.5" strokeWidth={1.5} />
          {t.balconies.door}
        </button>
      )}
      {overlap && <p className="mt-2 text-caption text-danger">{t.balconies.overlap}</p>}
    </li>
  );
}
