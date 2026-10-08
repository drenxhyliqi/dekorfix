import assert from "node:assert/strict";
import { test } from "node:test";

import { estimateMaterial, formatQuantity } from "./estimate.ts";

test("kilograms span the published coverage range", () => {
  // Beton Kontakt: 2–4 m²/kg.
  const estimate = estimateMaterial(40, { minM2PerKg: 2, maxM2PerKg: 4 }, [5, 20]);
  assert.equal(estimate?.minKg, 10);
  assert.equal(estimate?.maxKg, 20);
});

test("packs cover the upper estimate", () => {
  const estimate = estimateMaterial(40, { minM2PerKg: 2, maxM2PerKg: 4 }, [5, 20]);
  assert.deepEqual(estimate?.packs, [
    { sizeKg: 5, count: 4 },
    { sizeKg: 20, count: 1 },
  ]);
  // 100 m² of Fasadex at 3.5–4 m²/kg needs up to 28.6 kg: two 25 kg packs.
  assert.deepEqual(estimateMaterial(100, { minM2PerKg: 3.5, maxM2PerKg: 4 }, [25])?.packs, [{ sizeKg: 25, count: 2 }]);
});

test("an exact fit does not round up an extra pack", () => {
  assert.deepEqual(estimateMaterial(80, { minM2PerKg: 4, maxM2PerKg: 4 }, [20])?.packs, [{ sizeKg: 20, count: 1 }]);
});

test("no area, no estimate", () => {
  assert.equal(estimateMaterial(0, { minM2PerKg: 2, maxM2PerKg: 4 }, [20]), null);
  assert.equal(estimateMaterial(Number.NaN, { minM2PerKg: 2, maxM2PerKg: 4 }, [20]), null);
  assert.equal(estimateMaterial(10, { minM2PerKg: 0, maxM2PerKg: 4 }, [20]), null);
});

test("quantities read the same on server and browser", () => {
  assert.equal(formatQuantity(28.5714, "en"), "28.6");
  assert.equal(formatQuantity(28.5714, "sq"), "28,6");
  assert.equal(formatQuantity(25, "sq"), "25");
  assert.equal(formatQuantity(6.666, "en"), "6.7");
});
