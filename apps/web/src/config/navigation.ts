import { JOB_IDS, type JobId } from "@/features/finder/model";
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
  menu?: "products" | "finder";
  /** Active only on the exact path (the homepage would otherwise match everything). */
  exact?: boolean;
}> = [
  { key: "home", path: routes.home, exact: true },
  { key: "products", path: routes.products, menu: "products" },
  { key: "finder", path: routes.finder, menu: "finder" },
  { key: "projects", path: routes.projects },
  { key: "projectStudio", path: routes.projectStudio },
  { key: "whereToBuy", path: routes.whereToBuy },
  { key: "about", path: routes.about },
];

export type ProductCategoryKey = keyof Dictionary["productCategories"];

/** Dekorfix product categories: the five on dekorfix.net, then the fiberglass mesh. */
export const productCategories: ReadonlyArray<{ key: ProductCategoryKey; path: string }> = (
  ["adhesives", "facades", "bases", "paints", "plasters", "mesh"] as const
).map((key) => ({ key, path: routes.productCategory(key) }));

/** Task keys of content/solutions.ts (the catalog's "Use" filter). */
export type SolutionKey = keyof Dictionary["solutionCopy"];

/** The jobs the product finder starts from, each opening the finder on that job. */
export const finderJobs: ReadonlyArray<{ key: JobId; path: string }> = JOB_IDS.map((key) => ({
  key,
  path: routes.finderJob(key),
}));

export const legalNav: ReadonlyArray<{ key: keyof Dictionary["legal"]; path: string }> = [
  { key: "privacy", path: routes.privacy },
  { key: "terms", path: routes.terms },
  { key: "cookies", path: routes.cookies },
];
