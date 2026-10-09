"use client";

import { Clock, LocateFixed, MapPin, Navigation, Phone, Plus, RotateCcw, Search, X } from "lucide-react";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { distanceKm } from "@/content/stores";
import { fold } from "@/features/search/match";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

import { KosovoMap, type MapStore } from "./kosovo-map";
import "./stores.css";

export interface LocatorStore extends MapStore {
  confirmed: boolean;
  name: string;
  address: string;
  phone: string;
  hours: string;
  directions: string[];
  /** Straight-line distance from the factory, rounded. */
  fromFactoryKm: number;
  mapsUrl: string;
}

type Copy = Dictionary["storesPage"];
type Nearest = { state: "idle" } | { state: "locating" } | { state: "found"; id: string; km: number } | { state: "error" };

/** Map and list side by side (stacked on phones), always showing the same store. */
export function StoreLocator({
  stores,
  factory,
  copy,
  credit,
}: {
  stores: LocatorStore[];
  factory: { lat: number; lng: number; municipality: string };
  copy: Copy;
  credit: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [nearest, setNearest] = useState<Nearest>({ state: "idle" });
  const mapRef = useRef<HTMLDivElement>(null);

  const words = fold(query).trim();
  const shown = words ? stores.filter((store) => fold(store.city).includes(words)) : stores;
  const matches = new Set(shown.map((store) => store.id));
  const active = stores.find((store) => store.id === selected) ?? null;

  /** From the map: open the store in the list and bring it into view (inside the list only on desktop). */
  const selectFromMap = (id: string | null) => {
    setSelected(id);
    if (!id) return;
    requestAnimationFrame(() => {
      const head = document.getElementById(`store-${id}`);
      if (head && window.matchMedia("(min-width: 1024px)").matches) head.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };
  const showOnMap = (id: string) => {
    setSelected(id);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const findNearest = () => {
    if (!("geolocation" in navigator)) return setNearest({ state: "error" });
    setNearest({ state: "locating" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here = { lat: coords.latitude, lng: coords.longitude };
        const best = stores
          .map((store) => ({ id: store.id, km: distanceKm(here, store) }))
          .sort((a, b) => a.km - b.km)[0];
        if (!best) return setNearest({ state: "error" });
        setQuery("");
        setNearest({ state: "found", id: best.id, km: Math.round(best.km) });
        selectFromMap(best.id);
      },
      () => setNearest({ state: "error" }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const nearestStore = nearest.state === "found" ? stores.find((store) => store.id === nearest.id) : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16">
      {/* Map: pinned beside the list on desktop. */}
      <div className="lg:col-span-7">
        {/* Sticky wrapper: the frame's own `position: relative` would override `sticky`. */}
        <div className="lg:sticky lg:top-24">
          <div ref={mapRef} className="sl-frame">
            <button
              type="button"
              onClick={() => setSelected(null)}
              data-hidden={active ? undefined : true}
              tabIndex={active ? 0 : -1}
              className="sl-reset"
            >
              <RotateCcw aria-hidden className="size-4" strokeWidth={1.75} />
              {copy.showAll}
            </button>

            <KosovoMap
              stores={stores}
              factory={factory}
              selected={selected}
              hovered={hovered}
              matches={matches}
              onSelect={selectFromMap}
              onHover={setHovered}
              labels={{ map: copy.mapLabel, factory: copy.factory, factoryPlace: copy.factoryPlace }}
            />

            {active ? (
              <div className="lg:hidden">
                <div key={active.id} className="sl-peek">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[1.0625rem] font-medium text-text">{active.city}</p>
                    <p className="truncate text-small tabular-nums text-text-secondary">
                      {copy.fromFactory.replace("{km}", String(active.fromFactoryKm))}
                    </p>
                  </div>
                  <a
                    href={`#store-${active.id}`}
                    className="inline-flex h-10 shrink-0 items-center rounded-sm bg-inverse px-4 text-small font-medium text-inverse-text"
                  >
                    {copy.details}
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label={copy.showAll}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-text-secondary hover:bg-surface-muted"
                  >
                    <X aria-hidden className="size-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ) : null}
            <p className="sl-credit">{credit}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{copy.search}</span>
            <Search
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search}
              className="sl-search"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={copy.clearSearch}
                className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-text-tertiary hover:bg-surface-muted hover:text-text"
              >
                <X aria-hidden className="size-4" strokeWidth={1.75} />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={findNearest}
            disabled={nearest.state === "locating"}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-sm border border-border-strong px-4 text-[0.9375rem] font-medium text-text transition-colors duration-150 hover:border-text disabled:opacity-60"
          >
            <LocateFixed
              aria-hidden
              className={cn("size-4", nearest.state === "locating" && "animate-spin")}
              strokeWidth={1.75}
            />
            {nearest.state === "locating" ? copy.locating : copy.nearest}
          </button>
        </div>

        <div aria-live="polite" className="mt-4 min-h-5 text-small">
          {nearest.state === "found" && nearestStore && (
            <p className="text-text">
              {copy.nearestFound.replace("{city}", nearestStore.city).replace("{km}", String(nearest.km))}
            </p>
          )}
          {nearest.state === "error" && <p className="text-text-secondary">{copy.locationError}</p>}
          {nearest.state !== "found" && nearest.state !== "error" && (
            <p className="tabular-nums text-text-tertiary">
              {(shown.length === 1 ? copy.countOne : copy.count).replace("{n}", String(shown.length))}
            </p>
          )}
        </div>

        {shown.length ? (
          <ul key={words} className="mt-4 border-t border-border">
            {shown.map((store, index) => (
              <StoreItem
                key={store.id}
                store={store}
                number={stores.indexOf(store) + 1}
                index={index}
                open={store.id === selected}
                hot={store.id === hovered}
                copy={copy}
                onToggle={() => setSelected(store.id === selected ? null : store.id)}
                onHover={setHovered}
                onShowOnMap={() => showOnMap(store.id)}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-sm border border-dashed border-border-strong px-5 py-8 text-center text-small text-text-secondary">
            {copy.noResults.replace("{q}", query.trim())}
          </p>
        )}
      </div>
    </div>
  );
}

function StoreItem({
  store,
  number,
  index,
  open,
  hot,
  copy,
  onToggle,
  onHover,
  onShowOnMap,
}: {
  store: LocatorStore;
  number: number;
  index: number;
  open: boolean;
  hot: boolean;
  copy: Copy;
  onToggle: () => void;
  onHover: (id: string | null) => void;
  onShowOnMap: () => void;
}) {
  const bodyId = `store-body-${store.id}`;
  return (
    <li
      className="sl-item"
      data-open={open || undefined}
      data-hot={hot || undefined}
      style={{ "--i": index } as CSSProperties}
      onPointerEnter={() => onHover(store.id)}
      onPointerLeave={() => onHover(null)}
    >
      <button
        id={`store-${store.id}`}
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
        className="sl-head"
      >
        <span className="sl-num">{String(number).padStart(2, "0")}</span>
        <span className="min-w-0">
          <span className="block text-h4 text-text">{store.city}</span>
          <span className="mt-0.5 block truncate text-small tabular-nums text-text-tertiary">
            {copy.fromFactory.replace("{km}", String(store.fromFactoryKm))}
          </span>
        </span>
        <span aria-hidden className="sl-chevron">
          <Plus className="size-4" strokeWidth={1.75} />
        </span>
      </button>

      <div id={bodyId} className="sl-body" role="region" aria-labelledby={`store-${store.id}`}>
        <div className="sl-body-inner" inert={!open}>
          <div className="sl-body-content">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn("text-[1.0625rem] font-medium", store.confirmed ? "text-text" : "sl-placeholder")}>
                {store.name}
              </p>
              {!store.confirmed && <Badge variant="outline">{copy.placeholderBadge}</Badge>}
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field icon={<MapPin className="size-4" strokeWidth={1.75} />} label={copy.fields.address} placeholder={!store.confirmed}>
                {store.address}
              </Field>
              <Field icon={<Clock className="size-4" strokeWidth={1.75} />} label={copy.fields.hours} placeholder={!store.confirmed}>
                {store.hours}
              </Field>
              <Field icon={<Phone className="size-4" strokeWidth={1.75} />} label={copy.fields.phone} placeholder={!store.confirmed}>
                {store.phone}
              </Field>
            </dl>

            <div className="mt-6">
              <p className="text-label uppercase text-text-tertiary">{copy.fields.directions}</p>
              <ol className="mt-3 space-y-2.5">
                {store.directions.map((step, stepIndex) => (
                  <li key={step} className="flex gap-3 text-small">
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-xs bg-surface-muted text-caption tabular-nums text-text-secondary">
                      {stepIndex + 1}
                    </span>
                    <span className={store.confirmed ? "text-text" : "sl-placeholder"}>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-caption text-text-tertiary">
                {copy.fromFactory.replace("{km}", String(store.fromFactoryKm))} ({copy.straightLine})
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={store.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-sm bg-brand px-4 text-[0.9375rem] font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
              >
                <Navigation aria-hidden className="size-4" strokeWidth={1.75} />
                {copy.openMaps}
              </a>
              {store.confirmed && (
                <a
                  href={`tel:${store.phone.replace(/[^+\d]/g, "")}`}
                  className="inline-flex h-11 items-center gap-2 rounded-sm border border-border-strong px-4 text-[0.9375rem] font-medium text-text hover:border-text"
                >
                  <Phone aria-hidden className="size-4" strokeWidth={1.75} />
                  {copy.call}
                </a>
              )}
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={onShowOnMap}
                  className="inline-flex h-11 items-center gap-2 rounded-sm border border-border-strong px-4 text-[0.9375rem] font-medium text-text hover:border-text"
                >
                  <MapPin aria-hidden className="size-4" strokeWidth={1.75} />
                  {copy.showOnMap}
                </button>
              </div>
            </div>
            {!store.confirmed && <p className="mt-3 text-caption text-text-tertiary">{copy.mapsNote}</p>}
          </div>
        </div>
      </div>
    </li>
  );
}

function Field({
  icon,
  label,
  placeholder,
  children,
}: {
  icon: ReactNode;
  label: string;
  placeholder: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span aria-hidden className="mt-0.5 text-text-tertiary">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-caption uppercase tracking-[0.06em] text-text-tertiary">{label}</dt>
        <dd className={cn("mt-1 text-small", placeholder ? "sl-placeholder" : "text-text")}>{children}</dd>
      </div>
    </div>
  );
}
