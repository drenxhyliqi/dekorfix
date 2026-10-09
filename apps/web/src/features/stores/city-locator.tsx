"use client";

import { MapPin, RotateCcw, X } from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";

import type { Dictionary } from "@/i18n/dictionaries/en";

import { KosovoMap, type MapCity } from "./kosovo-map";
import "./stores.css";

export interface LocatorCity extends MapCity {
  /** Straight-line distance from the factory, rounded. */
  fromFactoryKm: number;
}

type Copy = Dictionary["exportPage"];

/** Map and list of cities side by side (stacked on phones); choosing a city draws its route from the factory. */
export function CityLocator({
  cities,
  factory,
  copy,
  credit,
}: {
  cities: LocatorCity[];
  factory: { lat: number; lng: number; municipality: string };
  copy: Copy;
  credit: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const active = cities.find((city) => city.id === selected) ?? null;

  const choose = (id: string) => {
    const next = id === selected ? null : id;
    setSelected(next);
    // Phones: the map sits above the list, so bring it into view.
    if (next && !window.matchMedia("(min-width: 1024px)").matches) {
      mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

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
              cities={cities}
              factory={factory}
              selected={selected}
              hovered={hovered}
              onSelect={setSelected}
              onHover={setHovered}
              labels={{ map: copy.mapLabel, factory: copy.factory, factoryPlace: copy.factoryPlace }}
            />

            {active ? (
              <div className="lg:hidden">
                <div key={active.id} className="sl-peek">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[1.0625rem] font-medium text-text">{active.name}</p>
                    <p className="truncate text-small tabular-nums text-text-secondary">
                      {copy.fromFactory.replace("{km}", String(active.fromFactoryKm))}
                    </p>
                  </div>
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
        <p className="text-small tabular-nums text-text-tertiary">{copy.count.replace("{n}", String(cities.length))}</p>
        <ul className="mt-4 border-t border-border">
          {cities.map((city, index) => (
            <li
              key={city.id}
              className="sl-item"
              data-open={city.id === selected || undefined}
              data-hot={city.id === hovered || undefined}
              style={{ "--i": index } as CSSProperties}
              onPointerEnter={() => setHovered(city.id)}
              onPointerLeave={() => setHovered(null)}
            >
              <button type="button" aria-pressed={city.id === selected} onClick={() => choose(city.id)} className="sl-head">
                <span className="sl-num">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block text-h4 text-text">{city.name}</span>
                  <span className="mt-0.5 block truncate text-small tabular-nums text-text-tertiary">
                    {copy.fromFactory.replace("{km}", String(city.fromFactoryKm))}
                  </span>
                </span>
                <span aria-hidden className="sl-chevron">
                  <MapPin className="size-4" strokeWidth={1.75} />
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-caption text-text-tertiary">{copy.straightLine}</p>
      </div>
    </div>
  );
}
