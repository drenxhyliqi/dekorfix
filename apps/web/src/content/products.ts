import type { ProductCategoryKey } from "@/config/navigation";
import type { Locale } from "@/i18n/config";

/**
 * Real Dekorfix products, as listed on dekorfix.net. Names and short
 * descriptors come from that site (English descriptors are translations).
 * The fiberglass meshes are not on dekorfix.net yet: their names and
 * descriptors come from the roll labels (packshots supplied by Dekorfix).
 * Temporary static source for the homepage; the catalog phase moves this
 * to the API. No technical data, prices or specifications here.
 */
export interface ProductSummary {
  slug: string;
  name: string;
  category: ProductCategoryKey;
  /** Packshot in /public/images/products (transparent WebP). */
  image: string;
  summary: Record<Locale, string>;
}

const image = (slug: string) => `/images/products/${slug}.webp`;

export const products: ProductSummary[] = [
  {
    slug: "styrofix",
    name: "Styrofix",
    category: "adhesives",
    image: image("styrofix"),
    summary: { sq: "Ngjitës për stiropor", en: "Adhesive for EPS insulation boards" },
  },
  {
    slug: "styrofiber",
    name: "Styrofiber",
    category: "adhesives",
    image: image("styrofiber"),
    summary: { sq: "Ngjitës për stiropor me fibra", en: "Fibre-reinforced adhesive for EPS boards" },
  },
  {
    slug: "sipofix",
    name: "Sipofix",
    category: "adhesives",
    image: image("sipofix"),
    summary: { sq: "Ngjitës për blloka siporeksi", en: "Adhesive for aerated concrete blocks" },
  },
  {
    slug: "thermofix",
    name: "Thermofix",
    category: "adhesives",
    image: image("thermofix"),
    summary: { sq: "Ngjitës termorezistues për pllaka", en: "Heat-resistant tile adhesive" },
  },
  {
    slug: "cerafix",
    name: "Cerafix",
    category: "adhesives",
    image: image("cerafix"),
    summary: { sq: "Ngjitës për qeramikë", en: "Ceramic tile adhesive" },
  },
  {
    slug: "megafix",
    name: "Megafix",
    category: "adhesives",
    image: image("megafix"),
    summary: { sq: "Ngjitës special për pllaka", en: "Special tile adhesive" },
  },
  {
    slug: "fasader",
    name: "Fasader",
    category: "facades",
    image: image("fasader"),
    summary: { sq: "Fasadë dekorative", en: "Decorative facade render" },
  },
  {
    slug: "baza",
    name: "Baza",
    category: "bases",
    image: image("baza"),
    summary: { sq: "Bazë për beton", en: "Primer for concrete" },
  },
  {
    slug: "beton-kontakt",
    name: "Beton Kontakt",
    category: "bases",
    image: image("beton-kontakt"),
    summary: { sq: "Beton kontakt", en: "Bonding primer for concrete" },
  },
  {
    slug: "fasadex",
    name: "Fasadex",
    category: "paints",
    image: image("fasadex"),
    summary: { sq: "Ngjyrë dispersive e brendshme", en: "Interior dispersion paint" },
  },
  {
    slug: "premium",
    name: "Premium",
    category: "paints",
    image: image("premium"),
    summary: { sq: "Ngjyrë e brendshme", en: "Interior paint" },
  },
  {
    slug: "confix",
    name: "Confix",
    category: "plasters",
    image: image("confix"),
    summary: { sq: "Llaç i gatshëm", en: "Ready-mixed plaster" },
  },
  {
    slug: "gletex",
    name: "Gletex",
    category: "plasters",
    image: image("gletex"),
    summary: { sq: "Glet cilësor", en: "High-quality skim coat" },
  },
  {
    slug: "niveler",
    name: "Niveler",
    category: "plasters",
    image: image("niveler"),
    summary: { sq: "Masë rrafshuese", en: "Levelling compound" },
  },
  {
    slug: "fiberglass-mesh-red",
    name: "Fiberglass Mesh Red",
    category: "mesh",
    image: image("fiberglass-mesh-red"),
    summary: { sq: "Rrjetë fiberglass rezistente ndaj alkaleve, e kuqe", en: "Alkali-resistant fiberglass mesh, red" },
  },
  {
    slug: "fiberglass-mesh-white",
    name: "Fiberglass Mesh White",
    category: "mesh",
    image: image("fiberglass-mesh-white"),
    summary: { sq: "Rrjetë fiberglass rezistente ndaj alkaleve, e bardhë", en: "Alkali-resistant fiberglass mesh, white" },
  },
];

export function getProduct(slug: string): ProductSummary | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProducts(slugs: string[]): ProductSummary[] {
  return slugs.map(getProduct).filter((product): product is ProductSummary => Boolean(product));
}
