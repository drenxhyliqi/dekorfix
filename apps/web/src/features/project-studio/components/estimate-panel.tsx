"use client";

import { ArrowRight, Printer } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { getProduct } from "@/content/products";
import { technicalData } from "@/content/technical-data";
import { localizePath } from "@/i18n/config";

import { useCopy } from "./studio-copy";
import { useStudio } from "./studio-store";
import { estimateProject, type Estimate, type ProductLine } from "../model/calculations";
import { finishSystems } from "../model/systems";

export function useEstimate(): Estimate {
  const { state } = useStudio();
  return useMemo(() => estimateProject(state.project, finishSystems, technicalData), [state.project]);
}

/** Order products by how they are applied (first layer first). */
const LAYER_ORDER = ["beton-kontakt", "baza", "confix", "niveler", "gletex", "fasadex", "cerafix", "megafix", "thermofix"];
export function sortLines(lines: ProductLine[]): ProductLine[] {
  return [...lines].sort((a, b) => LAYER_ORDER.indexOf(a.productSlug) - LAYER_ORDER.indexOf(b.productSlug));
}

export function EstimatePanel() {
  const { state, dispatch } = useStudio();
  const { t, num, locale } = useCopy();
  const estimate = useEstimate();
  const lines = sortLines(estimate.lines);

  return (
    <section data-tone="dark" aria-labelledby="estimate-title" className="rounded-sm p-6 md:p-7">
      <p id="estimate-title" className="flex items-center gap-2.5 text-label uppercase text-text-secondary">
        <span aria-hidden className="brand-mark" />
        {t.estimate.eyebrow}
      </p>

      <div className="mt-6 flex items-end gap-3">
        <span className="text-[3.5rem] font-medium leading-none tracking-[-0.04em] tabular-nums text-text">
          {num(estimate.totalArea, 1)}
        </span>
        <span className="pb-1.5 text-body text-text-secondary">m²</span>
      </div>
      <p className="mt-2 text-small text-text-secondary">
        {t.estimate.area} · {estimate.surfaces.length} {t.estimate.surfaces}
      </p>

      {lines.length === 0 ? (
        <p className="mt-8 border-t border-border pt-6 text-small text-text-secondary">{t.estimate.empty}</p>
      ) : (
        <ul className="mt-8 border-t border-border">
          {lines.map((line) => (
            <EstimateLine key={line.productSlug} line={line} />
          ))}
        </ul>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between text-small">
          <label htmlFor="reserve" className="text-text-secondary">
            {t.estimate.reserve}
          </label>
          <span className="tabular-nums text-text">{state.project.reservePercent}%</span>
        </div>
        <input
          id="reserve"
          type="range"
          min={0}
          max={30}
          step={5}
          value={state.project.reservePercent}
          onChange={(event) => dispatch({ type: "reserve", percent: Number(event.target.value) })}
          className="mt-3 w-full accent-[var(--color-brand)]"
        />
      </div>

      <ButtonLink
        href={`${localizePath(locale, routes.requestQuote)}?from=project-studio`}
        variant="accent"
        size="lg"
        className="mt-8 w-full"
        trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
      >
        {t.estimate.cta}
      </ButtonLink>
      <p className="mt-5 text-caption text-text-tertiary">{t.estimate.note}</p>
      <p className="mt-2 text-caption text-text-tertiary">{t.estimate.recommendation}</p>
    </section>
  );
}

function EstimateLine({ line }: { line: ProductLine }) {
  const { t, num } = useCopy();
  const product = getProduct(line.productSlug);
  return (
    <li className="flex items-start gap-3 border-b border-border py-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xs bg-surface-strong">
        {product && <Image src={product.image} alt="" width={40} height={40} className="size-9 object-contain" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-small font-medium text-text">{product?.name ?? line.productSlug}</span>
          {line.quantity ? (
            <span className="whitespace-nowrap text-small tabular-nums text-text">
              {line.quantity.packs} × {line.quantity.packSizeKg} kg
            </span>
          ) : (
            <span className="whitespace-nowrap text-caption text-text-tertiary">{t.estimate.pending}</span>
          )}
        </span>
        <span className="mt-0.5 block text-caption tabular-nums text-text-tertiary">
          {num(line.coatedArea)} m²
          {line.quantity && ` · ${t.estimate.estimated} ${num(line.quantity.minKg, 1)}–${num(line.quantity.maxKg, 1)} kg`}
        </span>
      </span>
    </li>
  );
}

export function MaterialList() {
  const { t, num, surfaceName, locale } = useCopy();
  const estimate = useEstimate();
  const lines = sortLines(estimate.lines);
  if (lines.length === 0) return null;

  return (
    <section aria-labelledby="materials-title" className="rounded-sm border border-border bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
        <h2 id="materials-title" className="text-h4 text-text">
          {t.materials.title}
        </h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-9 items-center gap-2 rounded-sm border border-border-strong px-3 text-small text-text transition-colors hover:border-text print:hidden"
        >
          <Printer aria-hidden className="size-4" strokeWidth={1.5} />
          {t.materials.print}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-small">
          <thead className="text-caption uppercase tracking-[0.06em] text-text-tertiary">
            <tr className="border-b border-border">
              <th scope="col" className="px-5 py-3 font-medium md:px-6">{t.materials.product}</th>
              <th scope="col" className="px-3 py-3 font-medium">{t.materials.surfaces}</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">{t.materials.area}</th>
              <th scope="col" className="px-5 py-3 text-right font-medium md:px-6">{t.materials.quantity}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const product = getProduct(line.productSlug);
              return (
                <tr key={line.productSlug} className="border-b border-border last:border-b-0">
                  <th scope="row" className="px-5 py-3 font-medium text-text md:px-6">
                    {product?.name ?? line.productSlug}
                    <span className="block text-caption font-normal text-text-tertiary">{product?.summary[locale]}</span>
                  </th>
                  <td className="px-3 py-3 text-text-secondary">{line.surfaces.map(surfaceName).join(", ")}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-text">{num(line.coatedArea)} m²</td>
                  <td className="px-5 py-3 text-right tabular-nums text-text md:px-6">
                    {line.quantity ? (
                      <>
                        {line.quantity.packs} × {line.quantity.packSizeKg} kg
                        <span className="block text-caption text-text-tertiary">{num(line.quantity.orderKg, 1)} kg</span>
                      </>
                    ) : (
                      <span className="text-text-tertiary">{t.estimate.pending}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
