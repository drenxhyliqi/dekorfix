"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { ProductTile } from "@/features/products/product-tile";
import { score } from "@/features/search/match";
import { cn } from "@/lib/utils";

import { QuickAdd } from "./add-to-cart";
import { useCart } from "./cart-context";
import {
  activeFilterCount,
  facetCounts,
  filterCatalog,
  filtersFromParams,
  filtersToQuery,
  NO_FILTERS,
  SORT_KEYS,
  toggle,
  type ShopFilters,
  type SortKey,
} from "./model";
import type { ShopProduct } from "./shop-products";
import "./shop.css";

export interface ShopCatalogProps {
  products: ShopProduct[];
  categories: Array<{ key: string; label: string; description: string }>;
  uses: Array<{ key: string; label: string }>;
  labels: { all: string; count: string; countOne: string; view: string };
}

const SEARCH_DELAY_MS = 250;

/** The catalog driven by the address (`?q=&category=&use=&pack=&sort=`), so every view can be shared. */
export function ShopCatalogFromUrl(props: ShopCatalogProps) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fromUrl = useMemo(() => filtersFromParams(params), [params]);

  // Filters change at once in state and reach the address a moment later, so quick
  // clicks build on each other. While our own update is on its way, address changes
  // are ours catching up; any other change (a menu link, back button) is taken over.
  const [filters, setFilters] = useState(fromUrl);
  const urlKey = filtersToQuery(fromUrl);
  const [seenKey, setSeenKey] = useState(urlKey);
  const [pushed, setPushed] = useState<string | null>(null);
  if (urlKey !== seenKey) {
    setSeenKey(urlKey);
    if (pushed === null) setFilters(fromUrl);
    else if (urlKey === pushed) setPushed(null);
  }

  return (
    <ShopCatalog
      {...props}
      filters={filters}
      onChange={(next) => {
        const key = filtersToQuery(next);
        setFilters(next);
        setPushed(key === urlKey ? null : key);
        router.replace(`${pathname}${key}`, { scroll: false });
      }}
    />
  );
}

/** Search, sort and filters (a sidebar on desktop, a drawer on smaller screens) over the product grid. */
export function ShopCatalog({
  products,
  categories,
  uses,
  labels,
  filters,
  onChange = () => {},
}: ShopCatalogProps & {
  filters: ShopFilters;
  /** Omitted in the prerendered copy shown until the address is read. */
  onChange?: (filters: ShopFilters) => void;
}) {
  const { copy: shop, locale } = useCart();
  const copy = shop.catalog;
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The search box keeps its own text and writes it to the address after a pause.
  const [draft, setDraft] = useState(filters.query);
  const [syncedQuery, setSyncedQuery] = useState(filters.query);
  if (filters.query !== syncedQuery) {
    setSyncedQuery(filters.query);
    setDraft(filters.query);
  }
  const latest = useRef({ filters, onChange });
  useEffect(() => {
    latest.current = { filters, onChange };
  });
  useEffect(() => {
    if (draft.trim() === latest.current.filters.query) return;
    const timer = setTimeout(() => latest.current.onChange({ ...latest.current.filters, query: draft.trim() }), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draft]);

  const labelOf = useMemo(() => {
    const names = new Map([...categories, ...uses].map((entry) => [entry.key, entry.label]));
    return (key: string) => names.get(key) ?? key;
  }, [categories, uses]);
  const match = useMemo(
    () => (item: ShopProduct) =>
      score(
        {
          title: item.name,
          text: item.summary,
          keywords: `${item.categoryLabel} ${item.uses.map(labelOf).join(" ")}`,
        },
        filters.query,
      ),
    [filters.query, labelOf],
  );

  const shown = filterCatalog(products, filters, match, locale);
  const counts = facetCounts(products, filters, match, locale);
  const packSizes = [...new Set(products.flatMap((item) => item.packs).filter((kg): kg is number => kg !== null))].sort(
    (a, b) => a - b,
  );
  const active = activeFilterCount(filters);
  const single = filters.categories.length === 1 ? categories.find((entry) => entry.key === filters.categories[0]) : undefined;
  const countLabel = (shown.length === 1 ? labels.countOne : labels.count).replace("{n}", String(shown.length));
  const set = (change: Partial<ShopFilters>) => onChange({ ...filters, ...change });
  const clearAll = () => {
    setDraft("");
    onChange({ ...NO_FILTERS, sort: filters.sort });
  };

  const chips: Array<{ key: string; label: string; remove: () => void }> = [
    ...(filters.query ? [{ key: "q", label: `“${filters.query}”`, remove: () => set({ query: "" }) }] : []),
    ...filters.categories.map((key) => ({
      key: `c-${key}`,
      label: labelOf(key),
      remove: () => set({ categories: toggle(filters.categories, key) }),
    })),
    ...filters.uses.map((key) => ({ key: `u-${key}`, label: labelOf(key), remove: () => set({ uses: toggle(filters.uses, key) }) })),
    ...filters.packs.map((kg) => ({ key: `p-${kg}`, label: `${kg} kg`, remove: () => set({ packs: toggle(filters.packs, kg) }) })),
  ];

  const panel = (
    <FilterPanel>
      <FilterGroup legend={copy.category}>
        {categories.map((entry) => (
          <FilterOption
            key={entry.key}
            label={entry.label}
            count={counts.category(entry.key)}
            checked={filters.categories.includes(entry.key)}
            onChange={() => set({ categories: toggle(filters.categories, entry.key) })}
          />
        ))}
      </FilterGroup>
      <FilterGroup legend={copy.use}>
        {uses.map((entry) => (
          <FilterOption
            key={entry.key}
            label={entry.label}
            count={counts.use(entry.key)}
            checked={filters.uses.includes(entry.key)}
            onChange={() => set({ uses: toggle(filters.uses, entry.key) })}
          />
        ))}
      </FilterGroup>
      <FilterGroup legend={copy.pack}>
        {packSizes.map((kg) => (
          <FilterOption
            key={kg}
            label={`${kg} kg`}
            count={counts.pack(kg)}
            checked={filters.packs.includes(kg)}
            onChange={() => set({ packs: toggle(filters.packs, kg) })}
          />
        ))}
      </FilterGroup>
    </FilterPanel>
  );

  return (
    <div>
      <div className="sh-toolbar">
        <div className="container-page flex flex-wrap items-center gap-2 py-3 sm:flex-nowrap sm:gap-3">
          <label className="relative min-w-0 basis-full sm:basis-auto sm:flex-1 lg:max-w-md">
            <span className="sr-only">{copy.search}</span>
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={copy.searchPlaceholder}
              enterKeyHint="search"
              className="sh-search"
            />
            {draft && (
              <button
                type="button"
                onClick={() => setDraft("")}
                aria-label={copy.clearSearch}
                className="absolute right-1.5 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-text-tertiary hover:bg-surface-muted hover:text-text"
              >
                <X aria-hidden className="size-4" strokeWidth={1.75} />
              </button>
            )}
          </label>

          {/* Visibility wrapper: the button's own display rule would override lg:hidden. */}
          <div className="lg:hidden">
            <button type="button" onClick={() => setDrawerOpen(true)} aria-haspopup="dialog" className="sh-tool">
              <SlidersHorizontal aria-hidden className="size-4" strokeWidth={1.75} />
              <span>{copy.filters}</span>
              {active - (filters.query ? 1 : 0) > 0 && (
                <span className="sh-tool-count tabular-nums">{active - (filters.query ? 1 : 0)}</span>
              )}
            </button>
          </div>

          <label className="sh-sort ml-auto">
            <span className="max-md:sr-only text-small text-text-tertiary">{copy.sort}</span>
            <select
              value={filters.sort}
              onChange={(event) => set({ sort: event.target.value as SortKey })}
              className="sh-sort-select"
            >
              {SORT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {copy.sorts[key]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="container-page grid gap-12 pb-section pt-10 md:pt-12 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16.5rem_minmax(0,1fr)] xl:gap-16">
        <aside aria-label={copy.filtersTitle} className="hidden lg:block">
          <div className="sh-sidebar">
            {panel}
            {active > 0 && (
              <button type="button" onClick={clearAll} className="mt-8 text-small font-medium text-text underline-offset-4 hover:underline">
                {copy.clearAll}
              </button>
            )}
          </div>
        </aside>

        <section aria-labelledby="shop-results" className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 id="shop-results" className="text-h2 text-text">
                {single && active === 1 ? single.label : active ? copy.results : labels.all}
              </h2>
              {single && active === 1 && <p className="mt-3 text-lead text-text-secondary">{single.description}</p>}
            </div>
            <p className="shrink-0 text-small tabular-nums text-text-tertiary" aria-live="polite">
              {countLabel}
            </p>
          </div>

          {chips.length > 0 && (
            <ul className="mb-8 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={chip.remove}
                    aria-label={copy.removeFilter.replace("{label}", chip.label)}
                    className="sh-chip"
                  >
                    {chip.label}
                    <X aria-hidden className="size-3.5" strokeWidth={1.75} />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={clearAll} className="px-2 text-small font-medium text-text underline-offset-4 hover:underline">
                  {copy.clearAll}
                </button>
              </li>
            </ul>
          )}

          {shown.length ? (
            // Keyed by the filters, so the cards rise in again when they change.
            <ul key={filtersToQuery({ ...filters, sort: "featured" })} className="pc-grid sh-grid">
              {shown.map((item, index) => (
                <li key={item.slug} className="pc-item" style={{ "--i": Math.min(index, 12) } as CSSProperties}>
                  <ProductTile
                    item={{ ...item, packs: null }}
                    viewLabel={labels.view}
                    action={<QuickAdd slug={item.slug} />}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-sm border border-dashed border-border-strong px-6 py-14 sm:items-center sm:text-center">
              <p className="text-h4 text-text">{copy.empty}</p>
              <p className="text-small text-text-secondary">{copy.emptyText}</p>
              <Button variant="secondary" onClick={clearAll} className="mt-2">
                {copy.clearAll}
              </Button>
            </div>
          )}
        </section>
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={copy.filtersTitle}
        closeLabel={shop.cart.continue}
        side="left"
        className="lg:hidden"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex-1 px-6 py-6 md:px-8">{panel}</div>
          <div className="sticky bottom-0 grid grid-cols-[auto_1fr] gap-3 border-t border-border bg-background px-6 py-4 md:px-8">
            <Button variant="secondary" onClick={clearAll} disabled={active === 0}>
              {copy.clearAll}
            </Button>
            <Button onClick={() => setDrawerOpen(false)}>
              {(shown.length === 1 ? copy.showResultsOne : copy.showResults).replace("{n}", String(shown.length))}
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

function FilterPanel({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-8">{children}</div>;
}

function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-label uppercase text-text-tertiary">{legend}</legend>
      <div className="flex flex-col">{children}</div>
    </fieldset>
  );
}

/** Checkbox row with the number of products it would show. */
function FilterOption({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  const empty = count === 0 && !checked;
  return (
    <label className={cn("sh-option", empty && "sh-option--empty")}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={empty} className="sh-check" />
      <span className="flex-1">{label}</span>
      <span className="text-caption tabular-nums text-text-tertiary">{count}</span>
    </label>
  );
}
