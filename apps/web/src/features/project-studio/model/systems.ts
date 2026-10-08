import type { FinishSystem, StudioProject, SystemStep } from "./types";

/**
 * Dekorfix facade systems, built from what each product's page says it is
 * for (dekorfix.net):
 *  - Styrofix: adhesive for EPS insulation boards
 *  - Styrofiber: fibre-reinforced adhesive for EPS boards (base coat that embeds the mesh)
 *  - Baza: primer before the decorative render
 *  - Fasader: decorative facade render
 * Recommended build-ups for planning; Dekorfix's technical team should confirm.
 */
const meshCoat: SystemStep = { productSlug: "styrofiber", coats: 1, role: "basecoat" };

export const finishSystems: Record<string, FinishSystem> = {
  thermal: {
    id: "thermal",
    insulation: true,
    mesh: "included",
    steps: [
      { productSlug: "styrofix", coats: 1, role: "bond" },
      meshCoat,
      { productSlug: "baza", coats: 1, role: "primer" },
      { productSlug: "fasader", coats: 1, role: "finish" },
    ],
  },
  render: {
    id: "render",
    insulation: false,
    mesh: "optional",
    meshCoat,
    steps: [
      { productSlug: "baza", coats: 1, role: "primer" },
      { productSlug: "fasader", coats: 1, role: "finish" },
    ],
  },
};

/** Preview colours for the render (illustrative; not Dekorfix's colour card). */
export const renderColors = ["#f3efe6", "#e9e1d2", "#ddd6c8", "#d9cfc0", "#cfd3cc", "#d7dadc", "#c9b9a3", "#a9a59c"];

export function createDefaultProject(name: string): StudioProject {
  const window = (id: string, floor: number, offset: number, width = 1.2) => ({
    id,
    kind: "window" as const,
    floor,
    offset,
    width,
    height: 1.4,
    sill: 0.9,
  });
  return {
    version: 2,
    name,
    building: {
      length: 10,
      width: 8,
      floors: [3, 2.9],
      roof: { type: "gable", pitch: 30, parapet: 0.6 },
    },
    facades: {
      A: {
        systemId: "thermal",
        mesh: true,
        openings: [
          window("a1", 0, 1.4),
          { id: "a2", kind: "door", floor: 0, offset: 4.5, width: 1, height: 2.2, sill: 0 },
          window("a3", 0, 7.4),
          window("a4", 1, 1.4),
          { id: "a5", kind: "door", floor: 1, offset: 4.5, width: 1, height: 2.2, sill: 0 },
          window("a6", 1, 7.4),
        ],
        balconies: [
          { id: "k1", floor: 1, offset: 3.5, width: 3, depth: 1.2, slab: 0.2, railing: "solid", railingHeight: 1 },
        ],
      },
      B: { systemId: "thermal", mesh: true, openings: [window("b1", 0, 3.4), window("b2", 1, 3.4)], balconies: [] },
      C: {
        systemId: "thermal",
        mesh: true,
        openings: [window("c1", 0, 2), window("c2", 0, 6.8), window("c3", 1, 2), window("c4", 1, 6.8)],
        balconies: [],
      },
      D: { systemId: "thermal", mesh: true, openings: [window("d1", 0, 3.4, 0.8), window("d2", 1, 3.4, 0.8)], balconies: [] },
    },
    insulationCm: 10,
    revealDepth: 0.15,
    renderColor: renderColors[1] ?? "#e9e1d2",
    reservePercent: 10,
  };
}
