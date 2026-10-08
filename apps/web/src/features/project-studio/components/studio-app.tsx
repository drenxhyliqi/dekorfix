"use client";

import { Check, RotateCcw } from "lucide-react";
import { useId } from "react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

import { BuildingPanel } from "./building-panel";
import { EstimatePanel, MaterialList } from "./estimate-panel";
import { FacadePanel } from "./facade-panel";
import { useCopy, StudioCopyProvider } from "./studio-copy";
import { StudioProvider, useStudio } from "./studio-store";
import { StudioViewport } from "./studio-viewport";

/** Project Studio application (client only; loaded without SSR). */
export default function StudioApp({ t, locale }: { t: Dictionary["studio"]; locale: Locale }) {
  return (
    <StudioCopyProvider t={t} locale={locale}>
      <StudioProvider defaultName={t.project.defaultName}>
        <ProjectBar />
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)_22rem]">
          <div className="order-2 min-w-0 rounded-sm border border-border bg-surface lg:order-1 lg:row-span-2 xl:row-span-1">
            <BuildingPanel />
            <FacadePanel />
          </div>
          <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2">
            <StudioViewport />
            <div className="hidden xl:block">
              <MaterialList />
            </div>
          </div>
          <div className="order-3 flex min-w-0 flex-col gap-4 xl:sticky xl:top-20">
            <EstimatePanel />
            <div className="xl:hidden">
              <MaterialList />
            </div>
          </div>
        </div>
      </StudioProvider>
    </StudioCopyProvider>
  );
}

function ProjectBar() {
  const { state, dispatch } = useStudio();
  const { t } = useCopy();
  const id = useId();
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <label htmlFor={id} className="sr-only">
          {t.project.name}
        </label>
        <input
          id={id}
          value={state.project.name}
          onChange={(event) => dispatch({ type: "rename", name: event.target.value })}
          className="min-w-0 flex-1 rounded-xs bg-transparent text-h4 text-text outline-none hover:bg-surface-muted focus-visible:bg-surface-muted"
        />
        <span className="hidden items-center gap-1.5 text-caption text-text-tertiary md:inline-flex">
          <Check aria-hidden className="size-3.5" strokeWidth={2} />
          {t.project.saved}
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          if (window.confirm(t.project.resetConfirm)) dispatch({ type: "reset", name: t.project.defaultName });
        }}
        className="inline-flex h-9 items-center gap-2 self-start rounded-sm px-2 text-small text-text-secondary transition-colors hover:bg-surface-muted hover:text-text sm:self-auto"
      >
        <RotateCcw aria-hidden className="size-4" strokeWidth={1.5} />
        {t.project.reset}
      </button>
    </div>
  );
}
