import type { Locale } from "@/i18n/config";

/**
 * Where Dekorfix products go, as Dekorfix gave them: ten cities in Kosovo and
 * six countries in Europe. No store names, addresses or contacts are
 * published for them.
 */

export interface ExportCity {
  id: string;
  name: string;
  /** Municipality on the map (see content/kosovo-map.ts). */
  municipality: string;
  /** City centre. */
  lat: number;
  lng: number;
  /** Which side of the pin the name sits on, so nearby labels do not collide. */
  label: "left" | "right" | "above";
}

const city = (
  id: string,
  name: string,
  municipality: string,
  lat: number,
  lng: number,
  label: ExportCity["label"] = "right",
): ExportCity => ({ id, name, municipality, lat, lng, label });

/** North to south, so the list follows the map. Kijevë is a town in the Malishevë municipality. */
export const exportCities: ExportCity[] = [
  city("podujeve", "Podujevë", "podujeva", 42.9106, 21.1932),
  city("drenas", "Drenas", "drenas", 42.6286, 20.8939),
  city("kline", "Klinë", "klina", 42.6217, 20.5778, "left"),
  city("kijeve", "Kijevë", "malisheva", 42.5664, 20.7169),
  city("malisheve", "Malishevë", "malisheva", 42.4822, 20.7458),
  city("gjakove", "Gjakovë", "gjakova", 42.3803, 20.4308),
  city("ferizaj", "Ferizaj", "ferizaj", 42.3702, 21.1553),
  // Above: the factory sits just below-left and Ferizaj to the right.
  city("suhareke", "Suharekë", "suhareka", 42.358, 20.8253, "above"),
  city("prizren", "Prizren", "prizren", 42.2139, 20.7397, "left"),
  city("dragash", "Dragash", "dragash", 42.0626, 20.6533),
];

/**
 * Countries outside Kosovo. Each route on the Europe map runs from the
 * factory to the country's capital; the distance shown is to that capital,
 * in a straight line.
 */
export interface ExportCountry {
  id: "slovenia" | "austria" | "switzerland" | "italy" | "germany" | "france";
  /** ISO 3166 alpha-2, shown on the departures board. */
  code: string;
  name: Record<Locale, string>;
  capital: { name: Record<Locale, string>; lat: number; lng: number };
}

export const exportCountries: ExportCountry[] = [
  {
    id: "slovenia",
    code: "SI",
    name: { sq: "Sllovenia", en: "Slovenia" },
    capital: { name: { sq: "Lubjana", en: "Ljubljana" }, lat: 46.0569, lng: 14.5058 },
  },
  {
    id: "austria",
    code: "AT",
    name: { sq: "Austria", en: "Austria" },
    capital: { name: { sq: "Vjena", en: "Vienna" }, lat: 48.2082, lng: 16.3738 },
  },
  {
    id: "switzerland",
    code: "CH",
    name: { sq: "Zvicra", en: "Switzerland" },
    capital: { name: { sq: "Berna", en: "Bern" }, lat: 46.948, lng: 7.4474 },
  },
  {
    id: "italy",
    code: "IT",
    name: { sq: "Italia", en: "Italy" },
    capital: { name: { sq: "Roma", en: "Rome" }, lat: 41.9028, lng: 12.4964 },
  },
  {
    id: "germany",
    code: "DE",
    name: { sq: "Gjermania", en: "Germany" },
    capital: { name: { sq: "Berlini", en: "Berlin" }, lat: 52.52, lng: 13.405 },
  },
  {
    id: "france",
    code: "FR",
    name: { sq: "Franca", en: "France" },
    capital: { name: { sq: "Parisi", en: "Paris" }, lat: 48.8566, lng: 2.3522 },
  },
];

/**
 * The Dekorfix plant, from its registered address (Zona Industriale, Shirokë,
 * Suharekë). The position is approximate, at Shirokë; the point every route
 * on both maps starts from.
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
