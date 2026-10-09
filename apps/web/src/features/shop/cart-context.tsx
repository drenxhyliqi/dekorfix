"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

import { CURRENCY, packPrice } from "@/content/shop";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

import { CartDrawer } from "./cart-drawer";
import { CartToast } from "./cart-toast";
import {
  addToCart,
  CART_STORAGE_KEY,
  cartTotals,
  lineKey,
  parseCart,
  setQuantity,
  type CartLine,
  type CartTotals,
} from "./model";
import type { ShopProduct } from "./shop-products";

/* ---- Storage: the cart lives in this browser only, shared by its tabs ---------- */

const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cache: CartLine[] | null = null;

function load(): CartLine[] {
  try {
    return parseCart(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]"));
  } catch {
    return EMPTY;
  }
}

function snapshot(): CartLine[] {
  return (cache ??= load());
}

function write(next: CartLine[]) {
  cache = next;
  try {
    if (next.length) localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(CART_STORAGE_KEY);
  } catch {}
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== CART_STORAGE_KEY && event.key !== null) return;
    cache = load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/* ---- Context ---------------------------------------------------------------- */

export type ShopCopy = Dictionary["shop"];

export interface CartEntry extends CartLine {
  key: string;
  product: ShopProduct;
  /** Price of one pack, or null when there is none. */
  price: number | null;
}

export interface ShopLinks {
  products: string;
  cart: string;
  checkout: string;
  terms: string;
  privacy: string;
}

interface CartContextValue {
  locale: Locale;
  copy: ShopCopy;
  links: ShopLinks;
  products: ShopProduct[];
  entries: CartEntry[];
  totals: CartTotals;
  /** False during the server render and hydration, before the stored cart is read. */
  ready: boolean;
  add: (slug: string, packKg: number | null, quantity: number) => void;
  /** Adds several lines at once, announced by a single toast. */
  addMany: (lines: CartLine[]) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  /** The cart panel; only the header's cart button opens it. */
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  /** The latest addition, announced by a toast; `id` restarts the toast on every add. */
  toast: CartToastData | null;
  /** Clears the toast; with an id, only if that toast is still the one shown. */
  dismissToast: (id?: number) => void;
}

export interface CartToastData extends CartLine {
  id: number;
  /** Other products added together with this one. */
  more: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}

export function CartProvider({
  locale,
  copy,
  links,
  products,
  children,
}: {
  locale: Locale;
  copy: ShopCopy;
  links: ShopLinks;
  products: ShopProduct[];
  children: ReactNode;
}) {
  const lines = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<CartToastData | null>(null);

  const value = useMemo<CartContextValue>(() => {
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    // Lines for products no longer in the catalogue are kept in storage but not shown or ordered.
    const entries = lines.flatMap((line) => {
      const product = bySlug.get(line.slug);
      return product ? [{ ...line, key: lineKey(line), product, price: packPrice(line.slug, line.packKg) }] : [];
    });
    return {
      locale,
      copy,
      links,
      products,
      entries,
      totals: cartTotals(
        entries,
        (line) => packPrice(line.slug, line.packKg),
        (line) => line.product.unit === "pack",
      ),
      ready,
      add: (slug, packKg, quantity) => {
        write(addToCart(snapshot(), { slug, packKg, quantity }));
        setToast((current) => ({ id: (current?.id ?? 0) + 1, slug, packKg, quantity, more: 0 }));
      },
      addMany: (added) => {
        const [first] = added;
        if (!first) return;
        write(added.reduce(addToCart, snapshot()));
        setToast((current) => ({ id: (current?.id ?? 0) + 1, ...first, more: added.length - 1 }));
      },
      setQuantity: (key, quantity) => write(setQuantity(snapshot(), key, quantity)),
      remove: (key) => write(setQuantity(snapshot(), key, 0)),
      clear: () => write(EMPTY),
      drawerOpen,
      setDrawerOpen: (open) => {
        setDrawerOpen(open);
        if (open) setToast(null);
      },
      toast,
      dismissToast: (id) => setToast((current) => (id === undefined || current?.id === id ? null : current)),
    };
  }, [lines, ready, products, locale, copy, links, drawerOpen, toast]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
      <CartToast />
    </CartContext.Provider>
  );
}

/* ---- Formatting --------------------------------------------------------------- */

export function useShopFormat() {
  const { locale, copy } = useCart();
  return useMemo(() => {
    const tag = locale === "sq" ? "sq-AL" : "en-GB";
    const number = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 });
    const money = new Intl.NumberFormat(tag, { style: "currency", currency: CURRENCY });
    return {
      kg: (value: number) => `${number.format(value)} kg`,
      pack: (packKg: number | null) => (packKg === null ? copy.pack.unconfirmed : `${number.format(packKg)} kg`),
      /** "Pack: 25 kg", "Roll: To be confirmed". */
      packLine: (unit: "pack" | "roll", packKg: number | null) =>
        `${unit === "roll" ? copy.cart.roll : copy.cart.pack}: ${
          packKg === null ? copy.pack.unconfirmed : `${number.format(packKg)} kg`
        }`,
      price: (value: number | null) => (value === null ? copy.price.onRequest : money.format(value)),
      packs: (n: number) => (n === 1 ? copy.quantity.packsOne : copy.quantity.packs).replace("{n}", number.format(n)),
    };
  }, [locale, copy]);
}
