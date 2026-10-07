import type { ReactNode } from "react";

/** Numbered block in the studio's control column. */
export function PanelSection({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section className="border-b border-border px-5 py-6 last:border-b-0 md:px-6">
      <h2 className="mb-5 flex items-baseline gap-3 text-h4 text-text">
        <span className="text-small tabular-nums text-text-tertiary">{index}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
