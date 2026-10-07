"use client";

import dynamic from "next/dynamic";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

const StudioApp = dynamic(() => import("./studio-app"), {
  ssr: false,
  loading: () => <div aria-busy className="h-[clamp(30rem,70vh,48rem)] animate-pulse rounded-sm border border-border bg-surface-muted" />,
});

/** The studio reads browser storage and WebGL, so it renders on the client only. */
export function StudioLoader({ t, locale }: { t: Dictionary["studio"]; locale: Locale }) {
  return <StudioApp t={t} locale={locale} />;
}
