import assert from "node:assert/strict";
import { test } from "node:test";

import { parseInline, parseRich, safeHref } from "./rich-text.ts";

test("only real pages, phone numbers and email addresses become links", () => {
  assert.equal(safeHref("/sq/product-finder"), "/sq/product-finder");
  assert.equal(safeHref(" /sq/products/baza "), "/sq/products/baza");
  assert.equal(safeHref("/en/products?category=mesh"), "/en/products?category=mesh");
  assert.equal(safeHref("/sq/shop-and-ordering"), null);
  assert.equal(safeHref("https://dekorfix.net/sq/cart", ["dekorfix.net"]), "/sq/cart");
  assert.equal(safeHref("https://evil.example/sq/cart", ["dekorfix.net"]), null);
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("tel:+383 44 216 541"), "tel:+38344216541");
  assert.equal(safeHref("mailto:info@dekorfix.net"), "mailto:info@dekorfix.net");
});

test("an invented link keeps its words but loses the link", () => {
  assert.deepEqual(parseInline("See [ordering](/sq/shop-and-ordering)."), [
    { kind: "text", text: "See " },
    { kind: "text", text: "ordering" },
    { kind: "text", text: "." },
  ]);
});

test("bold, links and bare paths", () => {
  assert.deepEqual(parseInline("**Baza** at [Gjej produktin]( /sq/product-finder) or /sq/cart."), [
    { kind: "bold", text: "Baza" },
    { kind: "text", text: " at " },
    { kind: "link", text: "Gjej produktin", href: "/sq/product-finder" },
    { kind: "text", text: " or " },
    { kind: "link", text: "/sq/cart", href: "/sq/cart" },
    { kind: "text", text: "." },
  ]);
});

test("paragraphs and lists", () => {
  const blocks = parseRich("You need:\n- Styrofix\n- Fasader\n\nThen order.");
  assert.equal(blocks.length, 3);
  assert.equal(blocks[1]?.kind, "list");
  assert.equal(blocks[1]?.kind === "list" && blocks[1].items.length, 2);
});
