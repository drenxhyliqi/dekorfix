import type { Locale } from "@/i18n/config";

/**
 * Points of sale. PLACEHOLDERS: Dekorfix has asked for ten stores, one per
 * city, but has not sent the details yet. The cities and their centre
 * coordinates are real (they place the pins and the directions link); every
 * store field below is a template slot, shown in [brackets] and labelled as a
 * placeholder on the page. Replace a store's `details` when Dekorfix confirms
 * it, and set `confirmed: true`.
 */

export interface StoreDetails {
  name: string;
  address: string;
  phone: string;
  hours: string;
  /** Step-by-step directions, from the city centre or a landmark. */
  directions: string[];
}

export interface Store {
  id: string;
  city: string;
  /** Municipality on the map (see content/kosovo-map.ts). */
  municipality: string;
  /** City centre until the store's own location is confirmed. */
  lat: number;
  lng: number;
  /** Which side of the pin the city name sits on, so nearby labels do not collide. */
  label: "left" | "right" | "above";
  confirmed: boolean;
  details: Record<Locale, StoreDetails>;
}

const placeholder = (city: string): Record<Locale, StoreDetails> => ({
  sq: {
    name: `[Emri i pikës së shitjes] · ${city}`,
    address: `[Rruga dhe numri], ${city}`,
    phone: "[+383 xx xxx xxx]",
    hours: "[Ditët dhe orari i punës]",
    directions: [
      `[Nga qendra e ${city}: rruga që merret]`,
      "[Pika referuese pranë pikës së shitjes]",
      "[Parkimi dhe ngarkimi i mallit]",
    ],
  },
  en: {
    name: `[Store name] · ${city}`,
    address: `[Street and number], ${city}`,
    phone: "[+383 xx xxx xxx]",
    hours: "[Opening days and hours]",
    directions: [
      `[From the centre of ${city}: the road to take]`,
      "[A landmark next to the store]",
      "[Parking and loading]",
    ],
  },
});

const store = (
  id: string,
  city: string,
  municipality: string,
  lat: number,
  lng: number,
  label: Store["label"] = "right",
): Store => ({ id, city, municipality, lat, lng, label, confirmed: false, details: placeholder(city) });

/** North to south, so the list follows the map. */
export const stores: Store[] = [
  store("podujeve", "Podujevë", "podujeva", 42.9106, 21.1932),
  store("mitrovice", "Mitrovicë", "mitrovica", 42.8914, 20.866, "left"),
  store("vushtrri", "Vushtrri", "vushtrri", 42.8231, 20.9675),
  store("prishtine", "Prishtinë", "pristina", 42.6629, 21.1655),
  store("peje", "Pejë", "peja", 42.6593, 20.2887),
  store("gjilan", "Gjilan", "gjilan", 42.4635, 21.4694, "left"),
  store("gjakove", "Gjakovë", "gjakova", 42.3803, 20.4308),
  store("ferizaj", "Ferizaj", "ferizaj", 42.3702, 21.1553),
  // Above: the factory sits just below-left and Ferizaj to the right.
  store("suhareke", "Suharekë", "suhareka", 42.358, 20.8253, "above"),
  store("prizren", "Prizren", "prizren", 42.2139, 20.7397, "left"),
];

/**
 * The Dekorfix plant, from its registered address (Zona Industriale, Shirokë,
 * Suharekë). The position is approximate, at Shirokë; the point every route
 * on the map starts from.
 */
export const factory = { lat: 42.3367, lng: 20.79, municipality: "suhareka" } as const;

/** Straight-line distance in km (haversine). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Google Maps directions to a point (the city centre until the address is confirmed). */
export function directionsUrl(target: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}`;
}
