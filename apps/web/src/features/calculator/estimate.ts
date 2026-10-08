/*
 * Material estimate from a published average coverage. Pure, so it runs
 * under `node --test`. Coverage is a range (m² per kg); the estimate is the
 * matching range of kilograms, and packs are counted for the upper end so the
 * order is never short.
 */

export interface CoverageRange {
  minM2PerKg: number;
  maxM2PerKg: number;
}

export interface MaterialEstimate {
  /** Kilograms at the best published coverage. */
  minKg: number;
  /** Kilograms at the lowest published coverage. */
  maxKg: number;
  /** For each pack size, how many cover the upper estimate. */
  packs: Array<{ sizeKg: number; count: number }>;
}

export function estimateMaterial(
  areaM2: number,
  coverage: CoverageRange,
  packSizesKg: readonly number[],
): MaterialEstimate | null {
  if (!(areaM2 > 0) || !(coverage.minM2PerKg > 0) || !(coverage.maxM2PerKg >= coverage.minM2PerKg)) return null;
  const minKg = areaM2 / coverage.maxM2PerKg;
  const maxKg = areaM2 / coverage.minM2PerKg;
  return {
    minKg,
    maxKg,
    packs: packSizesKg
      .filter((size) => size > 0)
      .map((sizeKg) => ({ sizeKg, count: Math.ceil(maxKg / sizeKg - 1e-9) })),
  };
}

/**
 * A quantity to one decimal, without a trailing ".0", with the locale's
 * decimal mark ("6,7" in Albanian). Done by hand rather than Intl, so the
 * server and the browser always agree.
 */
export function formatQuantity(value: number, locale: string): string {
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return locale === "sq" ? text.replace(".", ",") : text;
}
