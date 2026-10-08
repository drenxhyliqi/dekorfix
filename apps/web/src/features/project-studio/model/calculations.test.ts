import assert from "node:assert/strict";
import { test } from "node:test";

import {
  balconyArea,
  clampBalcony,
  clampOpening,
  estimateProject,
  facadeArea,
  facadeOutline,
  isGableEnd,
  openingIssues,
  roofRise,
} from "./calculations.ts";
import type { FinishSystem, ProductTechnicalData, StudioProject } from "./types.ts";

const project = (): StudioProject => ({
  version: 2,
  name: "Test",
  building: { length: 10, width: 8, floors: [3, 3], roof: { type: "flat", pitch: 30, parapet: 0.5 } },
  facades: {
    A: {
      systemId: "thermal",
      mesh: true,
      openings: [
        { id: "w", kind: "window", floor: 0, offset: 1, width: 1, height: 1.5, sill: 0.9 },
        { id: "d", kind: "door", floor: 0, offset: 4, width: 1, height: 2, sill: 0 },
      ],
      balconies: [],
    },
    B: { systemId: "render", mesh: false, openings: [], balconies: [] },
    C: { systemId: "render", mesh: true, openings: [], balconies: [] },
    D: { systemId: null, mesh: false, openings: [], balconies: [] },
  },
  insulationCm: 10,
  revealDepth: 0.2,
  renderColor: "#fff",
  reservePercent: 10,
});

const basecoat = { productSlug: "basecoat", coats: 1, role: "basecoat" as const };
const systems: Record<string, FinishSystem> = {
  thermal: {
    id: "thermal",
    insulation: true,
    mesh: "included",
    steps: [{ productSlug: "glue", coats: 1, role: "bond" }, basecoat, { productSlug: "render", coats: 1, role: "finish" }],
  },
  render: {
    id: "render",
    insulation: false,
    mesh: "optional",
    meshCoat: basecoat,
    steps: [{ productSlug: "render", coats: 1, role: "finish" }],
  },
};
const technical: Record<string, ProductTechnicalData> = {
  render: { slug: "render", packSizesKg: [25], coverage: { minM2PerKg: 2, maxM2PerKg: 4 } },
  glue: { slug: "glue", packSizesKg: [25], coverage: null },
};

test("facade area: walls and parapet, minus openings, plus reveals", () => {
  // 10 × (6 + 0.5) = 65; openings 1.5 + 2 = 3.5; reveals 0.2 × ((2×1.5+1) + (2×2+1)) = 1.8
  assert.deepEqual(facadeArea(project(), "A"), {
    gross: 65,
    openings: 3.5,
    net: 61.5,
    reveals: 1.8,
    balconies: 0,
    total: 63.3,
  });
});

test("gable ends sit on the shorter facades and add their triangle", () => {
  const p = project();
  p.building.roof = { type: "gable", pitch: 45, parapet: 0 };
  assert.equal(isGableEnd(p.building, "B"), true);
  assert.equal(isGableEnd(p.building, "A"), false);
  assert.ok(Math.abs(roofRise(p.building) - 4) < 1e-9); // span 8, 45°
  assert.equal(facadeArea(p, "B").gross, 64); // 8 × 6 + ½ × 8 × 4
  assert.equal(facadeArea(p, "A").gross, 60);
  assert.equal(facadeOutline(p.building, "B").length, 5);
});

test("estimate: layers per facade, optional mesh adds its base coat", () => {
  const estimate = estimateProject(project(), systems, technical);
  // A 63.3 (thermal, mesh) + B 52 (render) + C 65 (render + mesh); D has no system
  assert.equal(estimate.totalArea, 180.3);
  const render = estimate.lines.find((l) => l.productSlug === "render");
  assert.equal(render?.coatedArea, 180.3);
  assert.equal(render?.quantity?.maxKg, 90.15);
  assert.equal(render?.quantity?.packs, 4); // 99.17 kg / 25
  const coat = estimate.lines.find((l) => l.productSlug === "basecoat");
  assert.deepEqual(coat?.facades, ["A", "C"]);
  assert.equal(estimate.lines.find((l) => l.productSlug === "glue")?.quantity, null);
});

test("insulation covers the net wall; mesh wraps the reveals and counts corner pieces", () => {
  const { areaLines } = estimateProject(project(), systems, technical);
  const insulation = areaLines.find((l) => l.key === "insulation");
  const mesh = areaLines.find((l) => l.key === "mesh");
  assert.equal(insulation?.area, 61.5);
  assert.equal(mesh?.area, 128.3); // A 63.3 + C 65
  assert.equal(mesh?.orderArea, 141.13);
  assert.equal(mesh?.cornerPieces, 6); // window 4 + door 2
});

test("openings are validated per floor and clamped to their facade", () => {
  const p = project();
  const window = { id: "x", kind: "window" as const, floor: 1, offset: 9.5, width: 1, height: 1, sill: 2.5 };
  assert.deepEqual(openingIssues(p, "A", window).sort(), ["outside-height", "outside-length"]);
  assert.deepEqual(clampOpening(p.building, "A", window), { ...window, offset: 9, sill: 2 });
  // Same position on another floor does not overlap.
  const above = { id: "y", kind: "window" as const, floor: 1, offset: 1, width: 1, height: 1.5, sill: 0.9 };
  assert.deepEqual(openingIssues(p, "A", above), []);
  assert.deepEqual(openingIssues(p, "A", { ...above, floor: 0 }), ["overlap"]);
  assert.equal(clampOpening(p.building, "A", { ...above, floor: 7 }).floor, 1);
});

const balcony = (railing: "metal" | "solid") => ({
  id: "b",
  floor: 1,
  offset: 2,
  width: 3,
  depth: 1,
  slab: 0.2,
  railing,
  railingHeight: 1,
});

test("balcony: slab edge and underside; a masonry railing adds both faces and its top", () => {
  // Edge (3 + 2) × 0.2 = 1, underside 3 × 1 = 3
  assert.equal(balconyArea(balcony("metal")), 4);
  // + outer 5 × 1, inner (2.76 + 1.76) × 1, top (5 − 0.24) × 0.12
  assert.ok(Math.abs(balconyArea(balcony("solid")) - (4 + 5 + 4.52 + 0.5712)) < 1e-9);
});

test("balconies are rendered and meshed, but not insulated or bonded", () => {
  const p = project();
  p.facades.A.balconies = [balcony("metal")];
  assert.equal(facadeArea(p, "A").balconies, 4);
  assert.equal(facadeArea(p, "A").total, 67.3);
  const { lines, areaLines } = estimateProject(p, systems, technical);
  assert.equal(lines.find((l) => l.productSlug === "glue")?.coatedArea, 63.3);
  assert.equal(lines.find((l) => l.productSlug === "render")?.coatedArea, 184.3);
  assert.equal(areaLines.find((l) => l.key === "insulation")?.area, 61.5);
  assert.equal(areaLines.find((l) => l.key === "mesh")?.area, 132.3);
});

test("balconies stay on upper floors and inside the facade", () => {
  const p = project();
  const clamped = clampBalcony(p.building, "A", { ...balcony("metal"), floor: 0, offset: 9, depth: 5 });
  assert.equal(clamped.floor, 1);
  assert.equal(clamped.offset, 7);
  assert.equal(clamped.depth, 3);
});
