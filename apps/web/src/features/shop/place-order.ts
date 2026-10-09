"use server";

import type { OrderCreate, OrderCreated } from "@dekorfix/shared";

import { getProduct } from "@/content/products";
import { packOptions } from "@/content/shop";
import { ApiError, apiRequest } from "@/lib/api";

import type { CartLine } from "./model";

export interface OrderForm {
  locale: "sq" | "en";
  name: string;
  phone: string;
  email: string;
  company: string;
  businessNumber: string;
  delivery: "delivery" | "pickup";
  city: string;
  address: string;
  notes: string;
  /** Hidden from people; a filled value means the form was sent by a bot. */
  website: string;
}

export type PlaceOrderResult = { ok: true; reference: string } | { ok: false; error: "invalid" | "unavailable" };

/**
 * Sends an order to the API from the Next.js server (no CORS, and the API URL
 * stays server-side). Products and pack sizes are checked against the
 * catalogue here, so the order never carries names or sizes from the browser.
 */
export async function placeOrder(form: OrderForm, lines: CartLine[]): Promise<PlaceOrderResult> {
  if (form.website) return { ok: false, error: "invalid" };

  const items = lines.map((line) => {
    const product = getProduct(line.slug);
    if (!product || !packOptions(line.slug).includes(line.packKg)) return null;
    if (!Number.isInteger(line.quantity) || line.quantity < 1) return null;
    return { product_slug: product.slug, product_name: product.name, pack_kg: line.packKg, quantity: line.quantity };
  });
  if (!items.length || items.includes(null)) return { ok: false, error: "invalid" };

  const pickup = form.delivery === "pickup";
  const body: OrderCreate = {
    locale: form.locale,
    customer_name: form.name,
    phone: form.phone,
    email: form.email,
    company: form.company || null,
    business_number: form.businessNumber || null,
    delivery_method: form.delivery,
    city: pickup ? null : form.city,
    address: pickup ? null : form.address,
    notes: form.notes || null,
    items: items.filter((item) => item !== null),
  };

  try {
    const order = await apiRequest<OrderCreated>("/api/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return { ok: true, reference: order.reference };
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) return { ok: false, error: "invalid" };
    console.error("Order could not be sent", error);
    return { ok: false, error: "unavailable" };
  }
}
