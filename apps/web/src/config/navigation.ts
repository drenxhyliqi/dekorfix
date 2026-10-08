import type { Dictionary } from "@/i18n/dictionaries/en";

import { routes } from "./routes";

/**
 * Public information architecture. Labels come from the dictionaries;
 * components prefix paths with the active locale.
 */

export type NavKey = keyof Dictionary["nav"];

/** Main navigation, in order. `products` and `solutions` open a menu. */
export const primaryNav: ReadonlyArray<{
  key: NavKey;
  path: string;
  menu?: "products" | "solutions";
  /** Active only on the exact path (the homepage would otherwise match everything). */
  exact?: boolean;
}> = [
  { key: "home", path: routes.home, exact: true },
  { key: "products", path: routes.products, menu: "products" },
  { key: "solutions", path: routes.solutions, menu: "solutions" },
  { key: "projects", path: routes.projects },
  { key: "projectStudio", path: routes.projectStudio },
  { key: "resources", path: routes.resources },
  { key: "about", path: routes.about },
];

export type ProductCategoryKey = keyof Dictionary["productCategories"];

/** Dekorfix product categories, as organised on dekorfix.net. */
export const productCategories: ReadonlyArray<{ key: ProductCategoryKey; path: string }> = (
  ["adhesives", "facades", "bases", "paints", "plasters"] as const
).map((key) => ({ key, path: routes.productCategory(key) }));

export type SolutionKey = keyof Dictionary["solutionAreas"];

/** Solutions by task (see content/solutions.ts), in the order a building goes up. */
export const solutionAreas: ReadonlyArray<{ key: SolutionKey; path: string }> = (
  [
    ["preparation", "concrete-preparation"],
    ["masonry", "aerated-concrete-blocks"],
    ["insulation", "insulation-boards"],
    ["tiling", "laying-tiles"],
    ["smoothing", "plaster-and-levelling"],
    ["painting", "interior-painting"],
    ["facade", "facade-finish"],
  ] as const
).map(([key, slug]) => ({ key, path: routes.solution(slug) }));

export const legalNav: ReadonlyArray<{ key: keyof Dictionary["legal"]; path: string }> = [
  { key: "privacy", path: routes.privacy },
  { key: "terms", path: routes.terms },
  { key: "cookies", path: routes.cookies },
];
