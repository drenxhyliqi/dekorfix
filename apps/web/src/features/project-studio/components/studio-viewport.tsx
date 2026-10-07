"use client";

import { Box, Grid2x2, RectangleHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ElevationView } from "./elevation-view";
import { PlanView } from "./plan-view";
import { useCopy } from "./studio-copy";
import { useStudio, type StudioView } from "./studio-store";

const Room3D = dynamic(() => import("./room-3d"), { ssr: false, loading: () => <ViewportMessage kind="loading" /> });

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
const subscribeNever = () => () => {};

/** Plan / elevation / 3D canvas with its view switcher. */
export function StudioViewport() {
  const { state, dispatch } = useStudio();
  const { t, surfaceName } = useCopy();
  const webgl = useSyncExternalStore(subscribeNever, hasWebGL, () => true);
  const views: Array<{ id: StudioView; label: string; icon: ReactNode }> = [
    { id: "plan", label: t.views.plan, icon: <Grid2x2 aria-hidden className="size-4" strokeWidth={1.5} /> },
    { id: "elevation", label: t.views.elevation, icon: <RectangleHorizontal aria-hidden className="size-4" strokeWidth={1.5} /> },
    { id: "3d", label: t.views["3d"], icon: <Box aria-hidden className="size-4" strokeWidth={1.5} /> },
  ];

  return (
    <section aria-label={t.views.label} className="flex flex-col overflow-hidden rounded-sm border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        <p className="text-small text-text-secondary">
          <span className="text-text-tertiary">{t.views.label}:</span>{" "}
          <span className="font-medium text-text">{surfaceName(state.selected)}</span>
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

      <div className="relative h-[min(92vw,26rem)] bg-surface-muted md:h-[clamp(22rem,58vh,40rem)] bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:24px_24px]">
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
            <div className="absolute inset-0" role="img" aria-label={t.three.label}>
              <Room3D project={state.project} selected={state.selected} onSelect={(surface) => dispatch({ type: "select", surface })} />
              <p className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-border bg-background/85 px-4 py-2.5 text-caption text-text-tertiary">
                {t.three.hint}
              </p>
            </div>
          ) : (
            <ViewportMessage kind="unsupported" />
          ))}
      </div>
    </section>
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
