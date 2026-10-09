/**
 * Contracts for the shop's order endpoint.
 * Keep these in sync with `apps/api/app/schemas/order.py`.
 */

export type DeliveryMethod = "delivery" | "pickup";

export interface OrderItemInput {
  product_slug: string;
  product_name: string;
  /** Pack size in kilograms; null when no pack size is published yet. */
  pack_kg: number | null;
  quantity: number;
}

/** `POST /api/v1/orders` request body. */
export interface OrderCreate {
  locale: "sq" | "en";
  customer_name: string;
  phone: string;
  email: string;
  company?: string | null;
  business_number?: string | null;
  delivery_method: DeliveryMethod;
  /** Required for delivery. */
  city?: string | null;
  address?: string | null;
  notes?: string | null;
  items: OrderItemInput[];
}

/** `POST /api/v1/orders` response (201). */
export interface OrderCreated {
  reference: string;
  created_at: string;
}
