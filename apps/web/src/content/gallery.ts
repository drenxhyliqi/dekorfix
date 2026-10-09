import type { Locale } from "@/i18n/config";

/**
 * Photos of Dekorfix at work, from the company's own social posts
 * (dekorfix_assets). The posts' logo, slogan and contact bar are cropped
 * away. Descriptions say only what each photo shows; no project names or
 * places, since none were provided. Stock photos in the assets folder are
 * deliberately not used.
 */

export type GalleryGroup = "site" | "interiors" | "factory";

export interface GalleryPhoto {
  id: string;
  src: string;
  width: number;
  height: number;
  group: GalleryGroup;
  alt: Record<Locale, string>;
}

const photo = (id: string, width: number, height: number, group: GalleryGroup, alt: Record<Locale, string>) => ({
  id,
  src: `/images/gallery/${id}.webp`,
  width,
  height,
  group,
  alt,
});

/** In display order: the groups are mixed so every part of the grid has some of each. */
export const galleryPhotos: GalleryPhoto[] = [
  photo("interior-columns", 1650, 1095, "interiors", {
    en: "Finished walls and columns in an open interior",
    sq: "Mure dhe kolona të përfunduara në një hapësirë të hapur",
  }),
  photo("trowel-wall", 1650, 900, "site", {
    en: "A Dekorfix worker smoothing a wall with a trowel",
    sq: "Punëtor i Dekorfix duke lëmuar murin me mistri",
  }),
  photo("yellow-trowel", 1556, 1545, "site", {
    en: "Applying a finishing coat with a trowel",
    sq: "Aplikimi i shtresës përfundimtare me mistri",
  }),
  photo("factory-loading", 1200, 921, "factory", {
    en: "Loading Dekorfix products onto a truck at the factory",
    sq: "Ngarkimi i produkteve Dekorfix në kamion te fabrika",
  }),
  photo("two-workers", 1650, 890, "site", {
    en: "Two Dekorfix workers finishing interior walls",
    sq: "Dy punëtorë të Dekorfix duke përfunduar muret e brendshme",
  }),
  photo("interior-ceiling-grid", 1650, 1095, "interiors", {
    en: "A large interior during finishing works, with smoothed walls and columns",
    sq: "Hapësirë e madhe e brendshme gjatë punimeve përfundimtare, me mure dhe kolona të lëmuara",
  }),
  photo("mixing-fasadex", 1556, 1525, "site", {
    en: "A mixer and a bucket of Fasadex ready on site",
    sq: "Mikser dhe kovë Fasadex gati në objekt",
  }),
  photo("factory-forklift", 960, 720, "factory", {
    en: "A forklift loading a truck outside the Dekorfix factory",
    sq: "Pirun ngritës duke ngarkuar një kamion para fabrikës Dekorfix",
  }),
  photo("smoothing-corner", 1650, 910, "site", {
    en: "Smoothing a wall beside a corner",
    sq: "Lëmimi i murit pranë një qosheje",
  }),
  photo("interior-open-plan", 1650, 1060, "interiors", {
    en: "An open-plan interior with finished white walls",
    sq: "Hapësirë e hapur me mure të bardha të përfunduara",
  }),
  photo("fasadex-bucket", 1556, 1600, "site", {
    en: "Taking material from a bucket of Fasadex on site",
    sq: "Marrja e materialit nga kova e Fasadex në objekt",
  }),
  photo("factory-truck", 960, 720, "factory", {
    en: "A truck being loaded at the Dekorfix factory",
    sq: "Kamion duke u ngarkuar te fabrika Dekorfix",
  }),
];
