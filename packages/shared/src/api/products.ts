/**
 * Contracts for the product endpoints.
 * Keep these in sync with `apps/api/app/schemas/product.py`.
 */

export type ProductCategory = "adhesives" | "facades" | "bases" | "paints" | "plasters" | "mesh";
export type ProductUnit = "pack" | "roll";

/** `GET /api/v1/products` (published only) and `/products/{slug}`. Decimals arrive as strings. */
export interface PublicProduct {
  slug: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  summary_sq: string;
  summary_en: string;
  description_sq: string | null;
  description_en: string | null;
  /** A site path: /images/products/… or /media/products/… */
  image: string | null;
  pack_sizes_kg: number[];
  coverage_min_m2_per_kg: string | number | null;
  coverage_max_m2_per_kg: string | number | null;
  position: number;
}

/** Body of `POST /api/v1/admin/products` and `PUT /api/v1/admin/products/{id}`. */
export interface ProductInput extends Omit<PublicProduct, "coverage_min_m2_per_kg" | "coverage_max_m2_per_kg"> {
  coverage_min_m2_per_kg: number | null;
  coverage_max_m2_per_kg: number | null;
  is_published: boolean;
}

/** An admin product (`GET /api/v1/admin/products[/{id}]`). */
export interface AdminProduct extends PublicProduct {
  id: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
