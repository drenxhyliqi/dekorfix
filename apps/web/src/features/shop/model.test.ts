import assert from "node:assert/strict";
import { test } from "node:test";

import {
  addToCart,
  cartTotals,
  facetCounts,
  filterCatalog,
  filtersFromParams,
  filtersToQuery,
  NO_FILTERS,
  parseCart,
  setQuantity,
  type FilterableProduct,
} from "./model.ts";

const items: FilterableProduct[] = [
  { slug: "cerafix", name: "Cerafix", category: "adhesives", uses: ["tiling"], packs: [25] },
  { slug: "baza", name: "Baza", category: "bases", uses: ["preparation"], packs: [5, 15, 20] },
  { slug: "styrofix", name: "Styrofix", category: "adhesives", uses: ["insulation"], packs: [null] },
  { slug: "gletex", name: "Gletex", category: "plasters", uses: ["smoothing"], packs: [20] },
];
const any = () => 1;
const slugs = (list: FilterableProduct[]) => list.map((item) => item.slug);

test("filters combine across groups and match any value within one", () => {
  const filters = { ...NO_FILTERS, categories: ["adhesives", "plasters"], packs: [20, 25] };
  assert.deepEqual(slugs(filterCatalog(items, filters, any, "en")), ["cerafix", "gletex"]);
});

test("the query hides non-matches and ranks better matches first", () => {
  const filters = { ...NO_FILTERS, query: "fix" };
  const match = (item: FilterableProduct) => (item.slug === "styrofix" ? 5 : item.slug === "cerafix" ? 2 : 0);
  assert.deepEqual(slugs(filterCatalog(items, filters, match, "en")), ["styrofix", "cerafix"]);
});

test("sorting by name", () => {
  const sorted = filterCatalog(items, { ...NO_FILTERS, sort: "name-desc" }, any, "en");
  assert.deepEqual(slugs(sorted), ["styrofix", "gletex", "cerafix", "baza"]);
});

test("facet counts ignore their own group", () => {
  const counts = facetCounts(items, { ...NO_FILTERS, categories: ["bases"], packs: [20] }, any, "en");
  assert.equal(counts.category("plasters"), 1);
  assert.equal(counts.category("adhesives"), 0);
  assert.equal(counts.pack(25), 0);
  assert.equal(counts.pack(5), 1);
});

test("filters round-trip through the address", () => {
  const filters = { query: "glet", categories: ["plasters"], uses: [], packs: [20, 25], sort: "name-asc" as const };
  const query = filtersToQuery(filters);
  assert.equal(query, "?q=glet&category=plasters&pack=20,25&sort=name-asc");
  assert.deepEqual(filtersFromParams(new URLSearchParams(query)), filters);
  assert.equal(filtersToQuery(NO_FILTERS), "");
  assert.equal(filtersFromParams(new URLSearchParams("sort=cheapest&pack=x")).sort, "featured");
});

test("the same product and pack add up on one line", () => {
  let cart = addToCart([], { slug: "baza", packKg: 20, quantity: 2 });
  cart = addToCart(cart, { slug: "baza", packKg: 20, quantity: 3 });
  cart = addToCart(cart, { slug: "baza", packKg: 5, quantity: 1 });
  assert.deepEqual(cart, [
    { slug: "baza", packKg: 20, quantity: 5 },
    { slug: "baza", packKg: 5, quantity: 1 },
  ]);
  assert.deepEqual(setQuantity(cart, "baza:20", 0), [{ slug: "baza", packKg: 5, quantity: 1 }]);
  assert.equal(setQuantity(cart, "baza:5", 5000)[1]?.quantity, 999);
});

test("totals: packs, weight, and a price only when every line has one", () => {
  const cart = [
    { slug: "baza", packKg: 20, quantity: 2 },
    { slug: "styrofix", packKg: null, quantity: 4 },
  ];
  assert.deepEqual(cartTotals(cart, () => null), { packs: 6, weightKg: 40, weightPartial: true, weighed: 2, price: null });
  // A roll has no weight: it neither adds to the weight nor makes it partial.
  const rolls = cartTotals(cart, () => null, (line) => line.slug !== "styrofix");
  assert.deepEqual([rolls.weightKg, rolls.weightPartial, rolls.weighed], [40, false, 1]);
  assert.equal(cartTotals(cart.slice(0, 1), () => 12.5).price, 25);
});

test("stored carts are validated", () => {
  const stored = [
    { slug: "baza", packKg: 20, quantity: 2.4 },
    { slug: "styrofix", packKg: null, quantity: 1 },
    { slug: "x", packKg: -1, quantity: 1 },
    { slug: "y", packKg: 5, quantity: 0 },
    "junk",
  ];
  assert.deepEqual(parseCart(stored), [
    { slug: "baza", packKg: 20, quantity: 2 },
    { slug: "styrofix", packKg: null, quantity: 1 },
  ]);
  assert.deepEqual(parseCart({}), []);
});
