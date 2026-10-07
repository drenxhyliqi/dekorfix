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

export type SolutionAreaKey = keyof Dictionary["solutionAreas"];

/**
 * PLACEHOLDER solution areas (from the Phase 2 brief), not final Dekorfix
 * solutions. Replace once the solutions content architecture is agreed.
 */
export const solutionAreas: ReadonlyArray<{ key: SolutionAreaKey; path: string }> = (
  [
    ["interior", "interior"],
    ["exterior", "exterior"],
    ["facadeSystems", "facade-systems"],
    ["insulation", "insulation"],
    ["finishing", "finishing"],
  ] as const
).map(([key, slug]) => ({ key, path: routes.solution(slug) }));

export const legalNav: ReadonlyArray<{ key: keyof Dictionary["legal"]; path: string }> = [
  { key: "privacy", path: routes.privacy },
  { key: "terms", path: routes.terms },
  { key: "cookies", path: routes.cookies },
];
