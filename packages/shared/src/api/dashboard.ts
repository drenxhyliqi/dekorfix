/**
 * Contracts for the admin dashboard endpoint.
 * Keep these in sync with `apps/api/app/schemas/dashboard.py`.
 */

export interface DayCount {
  /** YYYY-MM-DD, a day in Kosovo's time zone. */
  date: string;
  count: number;
}

export interface PeriodTotals {
  total: number;
  previous_total: number;
  new_count: number;
  all_time: number;
  series: DayCount[];
}

export interface TopProduct {
  slug: string;
  name: string;
  quantity: number;
  orders: number;
}

export interface RecentOrder {
  reference: string;
  customer_name: string;
  city: string | null;
  delivery_method: "delivery" | "pickup";
  status: "new" | "confirmed" | "completed" | "cancelled";
  created_at: string;
  items: number;
  quantity: number;
}

export interface RecentMessage {
  reference: string;
  name: string;
  topic: "products" | "project" | "order" | "export" | "other";
  message: string;
  status: "new" | "answered" | "closed";
  created_at: string;
}

export interface ProductCounts {
  total: number;
  published: number;
  by_category: Record<string, number>;
}

/** `GET /api/v1/admin/dashboard?days=7|30|90` (needs an admin session). */
export interface DashboardStats {
  period_days: 7 | 30 | 90;
  generated_at: string;
  orders: PeriodTotals;
  messages: PeriodTotals;
  orders_by_status: Record<RecentOrder["status"], number>;
  orders_by_delivery: Record<RecentOrder["delivery_method"], number>;
  messages_by_topic: Record<RecentMessage["topic"], number>;
  top_products: TopProduct[];
  products: ProductCounts;
  recent_orders: RecentOrder[];
  recent_messages: RecentMessage[];
}
