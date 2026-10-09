import type { SolutionKey } from "@/config/navigation";

/**
 * Products by task, for the catalog's "Use" filter: each job and the Dekorfix
 * products for it. The grouping follows what each product is for, as stated
 * in its own description; to be confirmed by Dekorfix. `layer` is where the job sits in the wall build-up
 * (0 prepare, 1 bond, 2 level & plaster, 3 finish).
 */
export interface Solution {
  key: SolutionKey;
  products: string[];
  layer: 0 | 1 | 2 | 3;
}

export const solutions: Solution[] = [
  { key: "preparation", products: ["beton-kontakt", "baza"], layer: 0 },
  { key: "masonry", products: ["sipofix"], layer: 1 },
  { key: "insulation", products: ["styrofix", "styrofiber"], layer: 1 },
  { key: "tiling", products: ["cerafix", "thermofix", "megafix"], layer: 1 },
  { key: "smoothing", products: ["confix", "gletex", "niveler"], layer: 2 },
  { key: "painting", products: ["fasadex", "premium"], layer: 3 },
  { key: "facade", products: ["fasader"], layer: 3 },
];
