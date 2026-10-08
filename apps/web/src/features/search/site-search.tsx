"use client";

import { ArrowRight, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { highlights, score, type SearchEntry } from "./match";

import "./site-search.css";

export type SearchGroup = "products" | "solutions" | "categories" | "pages";

export interface SearchItem extends SearchEntry {
  id: string;
  group: SearchGroup;
  href: string;
  image?: string;
  /** Small label shown above the title, e.g. the product's category. */
  meta?: string;
}

export interface SiteSearchProps {
  items: SearchItem[];
  suggestions: string[];
  browse: Array<{ label: string; href: string }>;
  labels: {
    label: string;
    placeholder: string;
    clear: string;
    results: string;
    resultOne: string;
    none: string;
    noneHint: string;
    suggestions: string;
    browse: string;
    groups: Record<SearchGroup, string>;
  };
}

const GROUP_ORDER: SearchGroup[] = ["products", "solutions", "categories", "pages"];

/** The search, starting from the `?q=` in the address. */
export function SiteSearchFromUrl(props: SiteSearchProps) {
  return <SiteSearch {...props} initialQuery={useSearchParams().get("q") ?? ""} />;
}

/**
 * Search over products, solutions, product groups and pages. Results update
 * as you type and the query is kept in the address, so a search can be shared.
 */
export function SiteSearch({ items, suggestions, browse, labels, initialQuery }: SiteSearchProps & { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);

  const update = (value: string) => {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("q", value);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  };

  const trimmed = query.trim();
  const ranked = trimmed
    ? items
        .map((item) => ({ item, score: score(item, trimmed) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.item)
    : [];
  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: ranked.filter((item) => item.group === group),
  })).filter((entry) => entry.items.length > 0);

  return (
    <div>
      <form role="search" onSubmit={(event) => event.preventDefault()} className="ss-field">
        <Search aria-hidden className="ss-field-icon" strokeWidth={1.5} />
        <label htmlFor="site-search" className="sr-only">
          {labels.label}
        </label>
        <input
          id="site-search"
          type="search"
          value={query}
          onChange={(event) => update(event.target.value)}
          placeholder={labels.placeholder}
          autoComplete="off"
          // The page exists to search: start typing straight away.
          autoFocus
          className="ss-input"
        />
        {query && (
          <button type="button" onClick={() => update("")} aria-label={labels.clear} className="ss-clear">
            <X aria-hidden className="size-5" strokeWidth={1.5} />
          </button>
        )}
      </form>

      <div className="mt-10 md:mt-14" aria-live="polite">
        {!trimmed && (
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <p className="text-label uppercase text-text-tertiary">{labels.suggestions}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button type="button" onClick={() => update(suggestion)} className="ss-chip">
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-label uppercase text-text-tertiary">{labels.browse}</p>
              <ul className="mt-4 border-t border-border">
                {browse.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="ss-browse group/browse">
                      {link.label}
                      <ArrowRight
                        aria-hidden
                        className="size-4 text-text-tertiary transition-[color,translate] duration-200 group-hover/browse:translate-x-1 group-hover/browse:text-brand"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {trimmed && ranked.length === 0 && (
          <div>
            <p className="text-h3 text-text">{labels.none.replace("{q}", trimmed)}</p>
            <p className="mt-3 text-body text-text-secondary">{labels.noneHint}</p>
          </div>
        )}

        {ranked.length > 0 && (
          <>
            <p className="text-small text-text-tertiary">
              {(ranked.length === 1 ? labels.resultOne : labels.results)
                .replace("{n}", String(ranked.length))
                .replace("{q}", trimmed)}
            </p>
            {groups.map(({ group, items: groupItems }) => (
              <section key={group} className="mt-10">
                <h2 className="text-label uppercase text-text-tertiary">{labels.groups[group]}</h2>
                <ul className="mt-3 border-t border-border">
                  {groupItems.map((item) => (
                    <li key={item.id}>
                      <Link href={item.href} className="ss-result group/result">
                        {item.image ? (
                          <span className="ss-thumb">
                            <Image src={item.image} alt="" fill sizes="4rem" className="object-contain" />
                          </span>
                        ) : (
                          <span aria-hidden className="ss-thumb ss-thumb--mark">
                            <span className="brand-mark" />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          {item.meta && (
                            <span className="block text-label uppercase text-brand-text">{item.meta}</span>
                          )}
                          <span className="mt-1 block text-h4 text-text">
                            <Highlighted value={item.title} query={trimmed} />
                          </span>
                          <span className="mt-1 block truncate text-small text-text-secondary">
                            <Highlighted value={item.text} query={trimmed} />
                          </span>
                        </span>
                        <ArrowRight
                          aria-hidden
                          className="size-5 shrink-0 text-text-tertiary transition-[color,translate] duration-200 group-hover/result:translate-x-1 group-hover/result:text-brand"
                          strokeWidth={1.5}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/** The value with the query's words marked. */
function Highlighted({ value, query }: { value: string; query: string }) {
  const ranges = highlights(value, query);
  if (!ranges.length) return value;
  const parts: React.ReactNode[] = [];
  let at = 0;
  ranges.forEach(([start, end], index) => {
    if (start > at) parts.push(value.slice(at, start));
    parts.push(
      <mark key={index} className="ss-mark">
        {value.slice(start, end)}
      </mark>,
    );
    at = end;
  });
  if (at < value.length) parts.push(value.slice(at));
  return <>{parts}</>;
}
