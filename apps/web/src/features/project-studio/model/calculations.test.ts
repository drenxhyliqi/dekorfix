import assert from "node:assert/strict";
import { test } from "node:test";

import { clampOpening, estimateProject, openingIssues, surfaceArea } from "./calculations.ts";
import type { FinishSystem, ProductTechnicalData, StudioProject } from "./types.ts";

const project = (): StudioProject => ({
  version: 1,
  name: "Test",
  room: { length: 5, width: 4, height: 2.5 },
  walls: {
    A: { systemId: "paint", openings: [{ id: "w", kind: "window", offset: 1, width: 1.2, height: 1.5, sill: 0.9 }] },
    B: { systemId: "paint", openings: [] },
    C: { systemId: null, openings: [] },
    D: { systemId: "tiles", openings: [] },
  },
  floor: { systemId: null },
  ceiling: { systemId: "paint" },
  paintColor: "#fff",
  reservePercent: 10,
});

const systems: Record<string, FinishSystem> = {
  paint: { id: "paint", surfaces: ["wall", "ceiling"], appearance: "paint", steps: [{ productSlug: "paint", coats: 2 }] },
  tiles: { id: "tiles", surfaces: ["wall"], appearance: "tiles", steps: [{ productSlug: "adhesive", coats: 1 }] },
};
const technical: Record<string, ProductTechnicalData> = {
  paint: { slug: "paint", packSizesKg: [25], coverage: { minM2PerKg: 3.5, maxM2PerKg: 4 } },
  adhesive: { slug: "adhesive", packSizesKg: [25], coverage: null },
};

test("wall area subtracts openings", () => {
  assert.deepEqual(surfaceArea(project(), "A"), { gross: 12.5, openings: 1.8, net: 10.7 });
  assert.deepEqual(surfaceArea(project(), "B"), { gross: 10, openings: 0, net: 10 });
  assert.deepEqual(surfaceArea(project(), "ceiling"), { gross: 20, openings: 0, net: 20 });
});

test("estimate converts coverage to kilograms and whole packs", () => {
  const estimate = estimateProject(project(), systems, technical);
  const paint = estimate.lines.find((l) => l.productSlug === "paint");
  // A 10.7 + B 10 + ceiling 20 = 40.7 m², two coats = 81.4 m²
  assert.equal(paint?.coatedArea, 81.4);
  assert.equal(paint?.quantity?.minKg, 20.35); // 81.4 / 4
  assert.equal(paint?.quantity?.maxKg, 23.26); // 81.4 / 3.5
  assert.equal(paint?.quantity?.orderKg, 25.58); // + 10 % reserve
  assert.equal(paint?.quantity?.packs, 2);
  assert.equal(estimate.totalArea, 50.7); // + wall D 10 m² (tiles)
});

test("products without published coverage report area only", () => {
  const adhesive = estimateProject(project(), systems, technical).lines.find((l) => l.productSlug === "adhesive");
  assert.equal(adhesive?.coatedArea, 10);
  assert.equal(adhesive?.quantity, null);
});

test("openings are validated and clamped to their wall", () => {
  const p = project();
  const window = { id: "x", kind: "window" as const, offset: 4.5, width: 1, height: 1, sill: 2 };
  assert.deepEqual(openingIssues(p, "A", window).sort(), ["outside-height", "outside-length"]);
  assert.deepEqual(clampOpening(p, "A", window), { ...window, offset: 4, sill: 1.5 });
  const overlapping = { id: "y", kind: "window" as const, offset: 1.5, width: 1, height: 1, sill: 1 };
  assert.deepEqual(openingIssues(p, "A", overlapping), ["overlap"]);
});
