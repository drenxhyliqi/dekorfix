import type { SolutionKey } from "@/config/navigation";

/**
 * Solutions by task: each job and the Dekorfix products for it. The grouping
 * follows what each product is for, as stated in its own description; to be
 * confirmed by Dekorfix. `layer` is where the job sits in the wall build-up
 * (0 prepare, 1 bond, 2 level & plaster, 3 finish).
 */
export interface Solution {
  key: SolutionKey;
  slug: string;
  products: string[];
  layer: 0 | 1 | 2 | 3;
}

export const solutions: Solution[] = [
  { key: "preparation", slug: "concrete-preparation", products: ["beton-kontakt", "baza"], layer: 0 },
  { key: "masonry", slug: "aerated-concrete-blocks", products: ["sipofix"], layer: 1 },
  { key: "insulation", slug: "insulation-boards", products: ["styrofix", "styrofiber"], layer: 1 },
  { key: "tiling", slug: "laying-tiles", products: ["cerafix", "thermofix", "megafix"], layer: 1 },
  { key: "smoothing", slug: "plaster-and-levelling", products: ["confix", "gletex", "niveler"], layer: 2 },
  { key: "painting", slug: "interior-painting", products: ["fasadex", "premium"], layer: 3 },
  { key: "facade", slug: "facade-finish", products: ["fasader"], layer: 3 },
];

export function getSolution(slug: string): Solution | undefined {
  return solutions.find((solution) => solution.slug === slug);
}
