import assert from "node:assert/strict";
import { test } from "node:test";

import { chosenProducts, nextQuestion, questionsFor, recommend } from "./model.ts";

const slugs = (steps: ReturnType<typeof recommend>) => steps.map((step) => step.products.join("|"));

test("a facade asks about mesh only when it is not insulated", () => {
  assert.deepEqual(questionsFor("facade", {}), ["insulation"]);
  assert.deepEqual(questionsFor("facade", { insulation: "no" }), ["insulation", "mesh"]);
  assert.equal(nextQuestion("facade", { insulation: "no" }), "mesh");
  assert.equal(nextQuestion("facade", { insulation: "yes" }), null);
  assert.equal(nextQuestion("blocks", {}), null);
});

test("the thermal facade follows Project Studio's build-up", () => {
  assert.deepEqual(slugs(recommend("facade", { insulation: "yes" })), [
    "styrofix",
    "styrofiber",
    "fiberglass-mesh-red|fiberglass-mesh-white",
    "baza",
    "fasader",
  ]);
  assert.deepEqual(slugs(recommend("facade", { insulation: "no", mesh: "no" })), ["baza", "fasader"]);
});

test("tiles: the adhesive follows the tile type, and concrete adds a primer", () => {
  assert.deepEqual(slugs(recommend("tiles", { tileType: "heat", tileBase: "other" })), ["thermofix"]);
  assert.deepEqual(slugs(recommend("tiles", { tileType: "ceramic", tileBase: "concrete" })), ["beton-kontakt", "cerafix"]);
});

test("walls start where the wall is", () => {
  assert.equal(recommend("walls", { wallStart: "concrete" }).length, 4);
  assert.deepEqual(slugs(recommend("walls", { wallStart: "plastered" })), ["gletex|niveler", "fasadex|premium"]);
});

test("the cart gets every product, and one per choice", () => {
  const steps = recommend("facade", { insulation: "yes" });
  assert.deepEqual(chosenProducts(steps, {}), ["styrofix", "styrofiber", "fiberglass-mesh-red", "baza", "fasader"]);
  assert.deepEqual(chosenProducts(steps, { 2: "fiberglass-mesh-white", 3: "nonsense" }), [
    "styrofix",
    "styrofiber",
    "fiberglass-mesh-white",
    "baza",
    "fasader",
  ]);
});
