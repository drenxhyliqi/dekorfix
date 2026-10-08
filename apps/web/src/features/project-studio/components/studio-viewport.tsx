"use client";

import { Box, Grid2x2, Layers, RectangleHorizontal, Square } from "lucide-react";
import dynamic from "next/dynamic";
import { useSyncExternalStore, type ReactNode } from "react";

import { getProduct } from "@/content/products";
import { cn } from "@/lib/utils";

import { ElevationView } from "./elevation-view";
import { facadeLayers, LAYER_COLORS } from "./facade-layers";
import { PlanView } from "./plan-view";
import { useCopy } from "./studio-copy";
import { useStudio, type StudioView } from "./studio-store";

const House3D = dynamic(() => import("./house-3d"), { ssr: false, loading: () => <ViewportMessage kind="loading" /> });

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
const subscribeNever = () => () => {};

/** Plan / facade / 3D canvas with its view switcher. */
export function StudioViewport() {
  const { state, dispatch } = useStudio();
  const { t, facadeName } = useCopy();
  const webgl = useSyncExternalStore(subscribeNever, hasWebGL, () => true);
  const views: Array<{ id: StudioView; label: string; icon: ReactNode }> = [
    { id: "3d", label: t.views["3d"], icon: <Box aria-hidden className="size-4" strokeWidth={1.5} /> },
    { id: "elevation", label: t.views.elevation, icon: <RectangleHorizontal aria-hidden className="size-4" strokeWidth={1.5} /> },
    { id: "plan", label: t.views.plan, icon: <Grid2x2 aria-hidden className="size-4" strokeWidth={1.5} /> },
  ];

  return (
    <section aria-label={t.views.label} className="flex flex-col overflow-hidden rounded-sm border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        <p className="text-small text-text-secondary">
          <span className="text-text-tertiary">{t.views.label}:</span>{" "}
          <span className="font-medium text-text">{facadeName(state.selected)}</span>
        </p>
        <div role="tablist" aria-label={t.views.label} className="flex rounded-sm border border-border bg-surface-muted p-0.5">
          {views.map((view) => {
            const active = state.view === view.id;
            return (
              <button
                key={view.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => dispatch({ type: "view", view: view.id })}
                className={cn(
                  "inline-flex h-8 items-center gap-2 rounded-xs px-3 text-small transition-colors",
                  active ? "bg-background font-medium text-text shadow-sm" : "text-text-secondary hover:text-text",
                )}
              >
                {view.icon}
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative h-[min(110vw,30rem)] bg-surface-muted bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:24px_24px] md:h-[clamp(24rem,62vh,42rem)]">
        {state.view === "plan" && (
          <div className="absolute inset-0 p-2 md:p-4">
            <PlanView />
          </div>
        )}
        {state.view === "elevation" && (
          <div className="absolute inset-0">
            <ElevationView />
          </div>
        )}
        {state.view === "3d" &&
          (webgl ? (
            <div className="absolute inset-0">
              <div className="absolute inset-0" role="img" aria-label={t.three.label}>
                <House3D
                  project={state.project}
                  selected={state.selected}
                  layers={state.layers}
                  onSelect={(facade) => dispatch({ type: "select", facade })}
                />
              </div>
              <LayersToggle />
              {state.layers && <LayersLegend className="absolute right-3 top-3 hidden w-[15.5rem] border bg-background/92 shadow-sm backdrop-blur-sm sm:block" />}
              <p className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-border bg-background/85 px-4 py-2.5 text-caption text-text-tertiary">
                {t.three.hint}
              </p>
            </div>
          ) : (
            <ViewportMessage kind="unsupported" />
          ))}
      </div>
      {/* Phones: the legend sits under the canvas so it never covers the cutaway. */}
      {state.view === "3d" && state.layers && <LayersLegend className="border-t sm:hidden" />}
    </section>
  );
}

/** Finished house, or every facade peeled back to its layers. */
function LayersToggle() {
  const { state, dispatch } = useStudio();
  const { t } = useCopy();
  const options = [
    { on: false, label: t.three.finished, icon: <Square aria-hidden className="size-3.5" strokeWidth={1.75} /> },
    { on: true, label: t.three.layers, icon: <Layers aria-hidden className="size-3.5" strokeWidth={1.75} /> },
  ];
  return (
    <div
      role="radiogroup"
      aria-label={t.layers.title}
      className="absolute left-3 top-3 flex rounded-sm border border-border bg-background/90 p-0.5 shadow-sm backdrop-blur-sm"
    >
      {options.map((option) => {
        const active = state.layers === option.on;
        return (
          <button
            key={String(option.on)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => dispatch({ type: "layers", on: option.on })}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-xs px-2.5 text-caption transition-colors",
              active ? "bg-inverse font-medium text-inverse-text" : "text-text-secondary hover:text-text",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Build-up of the selected facade, from the wall outwards (matches the 3D cutaway, left to right). */
function LayersLegend({ className }: { className?: string }) {
  const { state } = useStudio();
  const { t, facadeName } = useCopy();
  const layers = facadeLayers(state.project, state.selected);

  return (
    <div className={cn("rounded-sm border-border p-3", className)}>
      <p className="text-caption font-medium text-text">
        {t.layers.title} · {facadeName(state.selected)}
      </p>
      <ol className="mt-2 space-y-1.5">
        <LegendRow color={LAYER_COLORS.masonry} label={t.layers.masonry} pattern="blocks" />
        {layers.map((layer, index) => {
          const product = layer.productSlug ? getProduct(layer.productSlug)?.name : undefined;
          const label = t.layers[layer.kind];
          return (
            <LegendRow
              key={`${layer.kind}-${index}`}
              color={layer.color}
              label={layer.kind === "insulation" ? `${label} · ${state.project.insulationCm} cm` : label}
              product={product}
              pattern={layer.kind === "mesh" ? "mesh" : undefined}
              highlight={layer.kind === "mesh"}
            />
          );
        })}
      </ol>
    </div>
  );
}

function LegendRow({
  color,
  label,
  product,
  pattern,
  highlight,
}: {
  color: string;
  label: string;
  product?: string;
  pattern?: "mesh" | "blocks";
  highlight?: boolean;
}) {
  return (
    <li className={cn("flex items-center gap-2 text-caption", highlight ? "font-medium text-text" : "text-text-secondary")}>
      <span
        aria-hidden
        className="size-3.5 shrink-0 rounded-[2px] border border-black/10"
        style={
          pattern === "mesh"
            ? {
                backgroundColor: "#fff",
                backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
                backgroundSize: "4px 4px",
              }
            : pattern === "blocks"
              ? {
                  backgroundColor: color,
                  backgroundImage: "linear-gradient(#b7b0a2 1px, transparent 1px)",
                  backgroundSize: "100% 5px",
                }
              : { backgroundColor: color }
        }
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {product && <span className="shrink-0 text-text-tertiary">{product}</span>}
    </li>
  );
}

function ViewportMessage({ kind }: { kind: "loading" | "unsupported" }) {
  const { t } = useCopy();
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-small text-text-tertiary">
      {kind === "loading" ? t.three.loading : t.three.unsupported}
    </div>
  );
}
