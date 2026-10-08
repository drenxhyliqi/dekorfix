import assert from "node:assert/strict";
import { test } from "node:test";

import { fold, highlights, score } from "./match.ts";

test("fold drops case and accents", () => {
  assert.equal(fold("Çfarë CILËSIA"), "cfare cilesia");
});

test("every word must match", () => {
  const entry = { title: "Styrofiber", text: "Fibre-reinforced adhesive for EPS boards" };
  assert.ok(score(entry, "styro") > 0);
  assert.ok(score(entry, "eps adhesive") > 0);
  assert.equal(score(entry, "styro paint"), 0);
  assert.equal(score(entry, "   "), 0);
});

test("accents are ignored both ways", () => {
  assert.ok(score({ title: "Ngjitës", text: "" }, "ngjites") > 0);
  assert.ok(score({ title: "Ngjites", text: "" }, "ngjitës") > 0);
});

test("title matches rank above text matches", () => {
  const titleHit = score({ title: "Gletex", text: "" }, "glet");
  const textHit = score({ title: "Confix", text: "plaster and glet" }, "glet");
  assert.ok(titleHit > textHit);
});

test("keywords find the entry", () => {
  assert.ok(score({ title: "Baza", text: "Primer", keywords: "Primers & Bases" }, "bases") > 0);
});

test("highlights map back onto the original, accented text", () => {
  assert.deepEqual(highlights("Cilësia fillon", "cilesia"), [[0, 7]]);
  assert.deepEqual(highlights("Beton Kontakt", "on"), [[3, 5], [7, 9]]);
  assert.deepEqual(highlights("Gletex", "x"), [[5, 6]]);
  assert.deepEqual(highlights("Gletex", ""), []);
});
