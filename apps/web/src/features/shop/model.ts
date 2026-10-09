/*
 * Shop model: catalog filters and the cart. Pure (type imports only), so it
 * runs under `node --test`.
 */

export const MAX_QUANTITY = 999;

/** Local storage key of the cart (also listed in the cookie policy). */
export const CART_STORAGE_KEY = "dekorfix:cart:v1";

export type SortKey = "featured" | "name-asc" | "name-desc";
export const SORT_KEYS: SortKey[] = ["featured", "name-asc", "name-desc"];

export interface ShopFilters {
  query: string;
  categories: string[];
  uses: string[];
  /** Pack sizes in kg. */
  packs: number[];
  sort: SortKey;
}

export const NO_FILTERS: ShopFilters = { query: "", categories: [], uses: [], packs: [], sort: "featured" };

/** What the filters need to know about a product. */
export interface FilterableProduct {
  slug: string;
  name: string;
  category: string;
  uses: string[];
  packs: Array<number | null>;
}

const list = (value: string | null) => (value ? value.split(",").filter(Boolean) : []);

/** Filters from the address, e.g. `?q=fix&category=adhesives,plasters&pack=25&sort=name-asc`. */
export function filtersFromParams(params: { get(name: string): string | null }): ShopFilters {
  const sort = params.get("sort");
  return {
    query: params.get("q")?.trim() ?? "",
    categories: list(params.get("category")),
    uses: list(params.get("use")),
    packs: list(params.get("pack"))
      .map(Number)
      .filter((kg) => Number.isFinite(kg) && kg > 0),
    sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : "featured",
  };
}

/** The address query for a set of filters, without defaults (empty when nothing is set). */
export function filtersToQuery(filters: ShopFilters): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categories.length) params.set("category", filters.categories.join(","));
  if (filters.uses.length) params.set("use", filters.uses.join(","));
  if (filters.packs.length) params.set("pack", filters.packs.join(","));
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  const query = params.toString().replaceAll("%2C", ",");
  return query ? `?${query}` : "";
}

export function activeFilterCount(filters: ShopFilters): number {
  return filters.categories.length + filters.uses.length + filters.packs.length + (filters.query ? 1 : 0);
}

/** Adds the value when missing, removes it when present. */
export function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

/**
 * Products that pass every filter group (any value within a group), sorted.
 * `match` scores the search query for a product: 0 hides it, and with the
 * default sort a better match comes first.
 */
export function filterCatalog<T extends FilterableProduct>(
  items: T[],
  filters: ShopFilters,
  match: (item: T) => number,
  locale: string,
): T[] {
  const shown = items
    .map((item, index) => ({ item, index, score: filters.query ? match(item) : 1 }))
    .filter(({ item, score }) => {
      if (score <= 0) return false;
      if (filters.categories.length && !filters.categories.includes(item.category)) return false;
      if (filters.uses.length && !item.uses.some((use) => filters.uses.includes(use))) return false;
      if (filters.packs.length && !item.packs.some((kg) => kg !== null && filters.packs.includes(kg))) return false;
      return true;
    });
  const byName = (a: { item: T }, b: { item: T }) => a.item.name.localeCompare(b.item.name, locale);
  shown.sort((a, b) => {
    if (filters.sort === "name-asc") return byName(a, b);
    if (filters.sort === "name-desc") return byName(b, a);
    return b.score - a.score || a.index - b.index;
  });
  return shown.map(({ item }) => item);
}

/** How many products each filter value would show, given the other groups' filters. */
export function facetCounts<T extends FilterableProduct>(
  items: T[],
  filters: ShopFilters,
  match: (item: T) => number,
  locale: string,
) {
  const count = (changed: Partial<ShopFilters>, keep: (item: T) => boolean) =>
    filterCatalog(items, { ...filters, ...changed }, match, locale).filter(keep).length;
  return {
    category: (key: string) => count({ categories: [] }, (item) => item.category === key),
    use: (key: string) => count({ uses: [] }, (item) => item.uses.includes(key)),
    pack: (kg: number) => count({ packs: [] }, (item) => item.packs.includes(kg)),
  };
}

/* ---- Cart ------------------------------------------------------------------- */

export interface CartLine {
  slug: string;
  /** Pack size in kg; null when the product has no published pack size. */
  packKg: number | null;
  quantity: number;
}

export const lineKey = (line: Pick<CartLine, "slug" | "packKg">) => `${line.slug}:${line.packKg ?? "-"}`;

const clampQuantity = (quantity: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(quantity)));

/** Adds packs to the cart; the same product and pack size add up on one line. */
export function addToCart(lines: CartLine[], line: CartLine): CartLine[] {
  const key = lineKey(line);
  const existing = lines.find((entry) => lineKey(entry) === key);
  if (!existing) return [...lines, { ...line, quantity: clampQuantity(line.quantity) }];
  return lines.map((entry) =>
    entry === existing ? { ...entry, quantity: clampQuantity(entry.quantity + line.quantity) } : entry,
  );
}

/** Sets a line's quantity; 0 or less removes it. */
export function setQuantity(lines: CartLine[], key: string, quantity: number): CartLine[] {
  if (quantity <= 0) return lines.filter((line) => lineKey(line) !== key);
  return lines.map((line) => (lineKey(line) === key ? { ...line, quantity: clampQuantity(quantity) } : line));
}

/** Cart lines from storage, dropping anything malformed. */
export function parseCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry: unknown) => {
    if (typeof entry !== "object" || entry === null) return [];
    const { slug, packKg, quantity } = entry as Record<string, unknown>;
    if (typeof slug !== "string" || typeof quantity !== "number" || !(quantity >= 1)) return [];
    if (packKg !== null && (typeof packKg !== "number" || !(packKg > 0))) return [];
    return [{ slug, packKg, quantity: clampQuantity(quantity) }];
  });
}

export interface CartTotals {
  /** Number of packs. */
  packs: number;
  /** Weight of the lines with a known pack size, in kg. */
  weightKg: number;
  /** Some weighed lines have no pack size yet, so the weight is incomplete. */
  weightPartial: boolean;
  /** Lines sold by weight; when 0 there is no weight to show. */
  weighed: number;
  /** Sum of the line prices, or null when any line has no price. */
  price: number | null;
}

/** `isWeighed` is false for lines not sold by weight (e.g. mesh rolls). */
export function cartTotals<T extends CartLine>(
  lines: T[],
  priceOf: (line: T) => number | null,
  isWeighed: (line: T) => boolean = () => true,
): CartTotals {
  let price: number | null = 0;
  const totals = { packs: 0, weightKg: 0, weightPartial: false, weighed: 0 };
  for (const line of lines) {
    totals.packs += line.quantity;
    if (isWeighed(line)) {
      totals.weighed += 1;
      if (line.packKg === null) totals.weightPartial = true;
      else totals.weightKg += line.packKg * line.quantity;
    }
    const each = priceOf(line);
    price = each === null || price === null ? null : price + each * line.quantity;
  }
  return { ...totals, price: lines.length ? price : null };
}
