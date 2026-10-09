import { technicalData } from "./technical-data";

/**
 * Shop settings. The website takes order requests: Dekorfix confirms price,
 * delivery and payment with the customer, and nothing is charged online.
 */

export const CURRENCY = "EUR";

/**
 * Price per pack in euro, by product slug and pack size in kg. Empty until
 * Dekorfix provides a price list; while a product has no price the shop shows
 * "Price on request" and the cart shows no total.
 */
export const packPrices: Record<string, Partial<Record<number, number>>> = {};

/** Pack sizes a product can be ordered in; `null` when none are published yet (Dekorfix confirms it). */
export function packOptions(slug: string): Array<number | null> {
  const sizes = technicalData[slug]?.packSizesKg ?? [];
  return sizes.length ? [...sizes] : [null];
}

export function packPrice(slug: string, packKg: number | null): number | null {
  return packKg === null ? null : (packPrices[slug]?.[packKg] ?? null);
}
