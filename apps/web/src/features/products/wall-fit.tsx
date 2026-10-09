import type { CSSProperties } from "react";

import { LAYER_COLORS, LayerWall } from "@/features/home/layer-wall";

import "@/features/home/layer-system.css";
import "./wall-fit.css";

/**
 * "Where it goes in the wall": the homepage's wall drawn still, painted up to
 * `layer` (0 prepare … 4 finish), with the five steps listed and that one marked.
 */
export function WallFit({
  layer,
  steps,
  label,
  title,
  titleId,
}: {
  layer: number;
  steps: ReadonlyArray<{ title: string; text: string }>;
  label: string;
  title: string;
  titleId: string;
}) {
  return (
    <>
      <p className="flex items-center gap-2.5 text-label uppercase text-text-tertiary">
        <span aria-hidden className="wf-swatch" style={{ "--swatch": LAYER_COLORS[layer] } as CSSProperties} />
        {label}
      </p>
      <h2 id={titleId} className="mt-4 text-h3 text-text">
        {title}
      </h2>
      <div className="wf-wall mt-6">
        <div className="ls-wall-frame">
          <LayerWall paintedThrough={layer} />
        </div>
      </div>
      <ol className="mt-6 border-t border-border">
        {steps.map((step, index) => (
          <li
            key={step.title}
            aria-current={index === layer ? "step" : undefined}
            className="wf-step"
            style={{ "--swatch": LAYER_COLORS[index] } as CSSProperties}
          >
            <span aria-hidden className="wf-swatch" />
            <span className="text-small tabular-nums text-text-tertiary">{String(index + 1).padStart(2, "0")}</span>
            <span className="flex-1">
              <span className="block text-body font-medium text-text">{step.title}</span>
              {index === layer && <span className="mt-1 block text-small text-text-secondary">{step.text}</span>}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
