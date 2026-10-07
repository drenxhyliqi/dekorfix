import type { FinishSystem, StudioProject } from "./types";

/**
 * Dekorfix finish systems for an interior room, built from what each
 * product's page says it is for (dekorfix.net):
 *  - Fasadex: interior dispersion paint
 *  - Gletex: final skim coat, 1 mm in two coats, interior walls and ceilings
 *  - Niveler: levelling of plastered interior walls and ceilings, min. 1 mm
 *  - Confix: ready-mixed plaster for walls and ceilings, 2.5 cm
 *  - Beton Kontakt: bonding layer on concrete before plaster and other layers
 *  - Cerafix: ceramic tiles on interior surfaces
 *  - Megafix: ceramic tiles, marble and granite, interior and exterior
 *  - Thermofix: porcelain and large-format tiles, walls and floors, underfloor heating
 * Recommended build-ups for planning; Dekorfix's technical team should confirm.
 */
export const finishSystems: Record<string, FinishSystem> = {
  paint: {
    id: "paint",
    surfaces: ["wall", "ceiling"],
    appearance: "paint",
    steps: [{ productSlug: "fasadex", coats: 2 }],
  },
  "skim-paint": {
    id: "skim-paint",
    surfaces: ["wall", "ceiling"],
    appearance: "paint",
    steps: [
      { productSlug: "gletex", coats: 2 },
      { productSlug: "fasadex", coats: 2 },
    ],
  },
  "level-paint": {
    id: "level-paint",
    surfaces: ["wall", "ceiling"],
    appearance: "paint",
    steps: [
      { productSlug: "niveler", coats: 1 },
      { productSlug: "fasadex", coats: 2 },
    ],
  },
  "plaster-system": {
    id: "plaster-system",
    surfaces: ["wall", "ceiling"],
    appearance: "paint",
    steps: [
      { productSlug: "beton-kontakt", coats: 1 },
      { productSlug: "confix", coats: 1 },
      { productSlug: "gletex", coats: 2 },
      { productSlug: "fasadex", coats: 2 },
    ],
  },
  "ceramic-tiles": {
    id: "ceramic-tiles",
    surfaces: ["wall"],
    appearance: "tiles",
    steps: [{ productSlug: "cerafix", coats: 1 }],
  },
  "floor-tiles": {
    id: "floor-tiles",
    surfaces: ["floor"],
    appearance: "tiles",
    steps: [{ productSlug: "megafix", coats: 1 }],
  },
  "large-tiles": {
    id: "large-tiles",
    surfaces: ["wall", "floor"],
    appearance: "largeTiles",
    steps: [{ productSlug: "thermofix", coats: 1 }],
  },
};

/** Preview colours for painted surfaces (illustrative; Fasadex is tintable). */
export const paintColors = ["#f4f1ea", "#e7e1d6", "#d8d4cc", "#c9cfc9", "#cdd5dc", "#e9dccb", "#b9b2a6", "#8f948f"];

export function createDefaultProject(name: string): StudioProject {
  return {
    version: 1,
    name,
    room: { length: 5, width: 4, height: 2.7 },
    walls: {
      A: { systemId: "skim-paint", openings: [{ id: "w1", kind: "window", offset: 1.9, width: 1.2, height: 1.4, sill: 0.9 }] },
      B: { systemId: "skim-paint", openings: [] },
      C: { systemId: "skim-paint", openings: [{ id: "d1", kind: "door", offset: 0.6, width: 0.9, height: 2.1, sill: 0 }] },
      D: { systemId: "skim-paint", openings: [] },
    },
    floor: { systemId: "floor-tiles" },
    ceiling: { systemId: "paint" },
    paintColor: paintColors[0] ?? "#f4f1ea",
    reservePercent: 10,
  };
}
