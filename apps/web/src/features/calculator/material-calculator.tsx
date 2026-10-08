"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

import { estimateMaterial, formatQuantity, type CoverageRange } from "./estimate";

import "./material-calculator.css";

export interface CalculatorProduct {
  slug: string;
  name: string;
  summary: string;
  image: string;
  href: string;
  coverage: CoverageRange;
  packSizesKg: number[];
}

export interface CalculatorLabels {
  product: string;
  area: string;
  result: string;
  packs: string;
  packsOr: string;
  coverage: string;
  note: string;
  view: string;
}

/**
 * Pick a product, enter the area: the estimated kilograms (as a range, from
 * the published coverage) and the packs that cover it, per pack size.
 */
export function MaterialCalculator({
  products,
  labels,
  locale,
}: {
  products: CalculatorProduct[];
  labels: CalculatorLabels;
  locale: string;
}) {
  const [slug, setSlug] = useState(products[0]?.slug ?? "");
  const [area, setArea] = useState("20");
  const areaId = useId();
  const product = products.find((entry) => entry.slug === slug) ?? products[0];
  const number = { format: (value: number) => formatQuantity(value, locale) };

  if (!product) return null;
  const areaM2 = Number(area.replace(",", "."));
  const estimate = estimateMaterial(areaM2, product.coverage, product.packSizesKg);
  const coverage = `${number.format(product.coverage.minM2PerKg)}–${number.format(product.coverage.maxM2PerKg)} m²/kg`;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <fieldset>
          <legend className="text-label uppercase text-text-tertiary">{labels.product}</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {products.map((entry) => {
              const selected = entry.slug === product.slug;
              return (
                <label key={entry.slug} className={cn("mc-option", selected && "mc-option--selected")}>
                  <input
                    type="radio"
                    name="product"
                    value={entry.slug}
                    checked={selected}
                    onChange={() => setSlug(entry.slug)}
                    className="sr-only"
                  />
                  <span className="mc-option-shot">
                    <Image src={entry.image} alt="" fill sizes="10rem" className="object-contain" />
                  </span>
                  <span className="mc-option-text">
                    <span className="block text-h4 text-text">{entry.name}</span>
                    <span className="mt-1 block text-small text-text-secondary">{entry.summary}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-10">
          <label htmlFor={areaId} className="text-label uppercase text-text-tertiary">
            {labels.area}
          </label>
          <div className="mc-area mt-3">
            <input
              id={areaId}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={area}
              onChange={(event) => setArea(event.target.value)}
              className="mc-area-input"
            />
            <span className="mc-area-unit">m²</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="mc-result" aria-live="polite">
          <p className="text-label uppercase text-text-tertiary">{labels.result}</p>
          <p className="mt-3 text-[clamp(2.5rem,1.5rem+3vw,4.5rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums text-text">
            {estimate ? `${number.format(estimate.minKg)}–${number.format(estimate.maxKg)}` : "–"}
            <span className="ml-2 text-h3 font-medium text-text-tertiary">kg</span>
          </p>

          <p className="mt-8 text-label uppercase text-text-tertiary">{labels.packs}</p>
          <ul className="mt-3">
            {(estimate?.packs ?? product.packSizesKg.map((sizeKg) => ({ sizeKg, count: 0 }))).map((pack, index) => (
              <li key={pack.sizeKg} className="mc-pack">
                {index > 0 && <span className="mc-pack-or">{labels.packsOr}</span>}
                <span className="text-h3 tabular-nums text-text">
                  {estimate ? pack.count : "–"} × {pack.sizeKg} kg
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-8 flex items-baseline justify-between gap-6 border-t border-border pt-5 text-small">
            <dt className="text-text-tertiary">{labels.coverage}</dt>
            <dd className="font-medium tabular-nums text-text">{coverage}</dd>
          </dl>

          <Link
            href={product.href}
            className="group/view mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-text"
          >
            {labels.view}: {product.name}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover/view:translate-x-1"
              strokeWidth={1.75}
            />
          </Link>
        </div>
        <p className="mt-4 text-small text-text-tertiary">{labels.note}</p>
      </div>
    </div>
  );
}
