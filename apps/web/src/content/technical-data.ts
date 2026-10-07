import type { ProductTechnicalData } from "@/features/project-studio/model/types";

/**
 * Coverage and pack sizes as published on dekorfix.net product pages
 * ("Shpenzimi mesatar"). `coverage: null` means no rate is published, so the
 * studio shows the area but no quantity. Replace with Dekorfix's technical
 * data sheets (and later the admin "Calculator" module) when available.
 *
 * Not used yet: Fasader 1.5 ("3,5 m²/kg") and Fasader 2.0 ("7–10 m²/kg"),
 * whose published values look inverted for a render and need confirmation.
 */
export const technicalData: Record<string, ProductTechnicalData> = {
  // dekorfix.net/sq/ngjyra: "Shpenzimi mesatar: 3.5 – 4 m²/KG", 25 KG
  fasadex: { slug: "fasadex", packSizesKg: [25], coverage: { minM2PerKg: 3.5, maxM2PerKg: 4 } },
  // dekorfix.net/sq/beton-kontakt: "Shpenzimi mesatar: 2-4 m2/kg", 5 KG / 20 KG
  "beton-kontakt": { slug: "beton-kontakt", packSizesKg: [5, 20], coverage: { minM2PerKg: 2, maxM2PerKg: 4 } },
  // dekorfix.net/sq/baza25: "Shpenzimi mesatar: 150-200 g/m2", 5 / 15 / 20 KG
  baza: { slug: "baza", packSizesKg: [5, 15, 20], coverage: { minM2PerKg: 5, maxM2PerKg: 6.67 } },
  // Pack sizes published; coverage not published.
  confix: { slug: "confix", packSizesKg: [25], coverage: null },
  gletex: { slug: "gletex", packSizesKg: [20], coverage: null },
  niveler: { slug: "niveler", packSizesKg: [25], coverage: null },
  cerafix: { slug: "cerafix", packSizesKg: [25], coverage: null },
  megafix: { slug: "megafix", packSizesKg: [25], coverage: null },
  thermofix: { slug: "thermofix", packSizesKg: [25], coverage: null },
};
