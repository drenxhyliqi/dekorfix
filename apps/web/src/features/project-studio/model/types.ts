/**
 * Project Studio domain model: the outside of a house. A rectangular
 * footprint, one or more floors, a roof and four facades (A front, B right,
 * C back, D left), each with its own finish system and openings per floor.
 * All measurements are in metres.
 */

export type FacadeId = "A" | "B" | "C" | "D";
export type RoofType = "flat" | "gable" | "hip";

export interface Opening {
  id: string;
  kind: "door" | "window";
  /** Floor index, 0 = ground floor. */
  floor: number;
  /** Distance from the facade's left end (seen from outside) to the opening. */
  offset: number;
  width: number;
  height: number;
  /** Height of the bottom edge above that floor's level (0 for doors). */
  sill: number;
}

/**
 * Balcony on an upper floor: a slab projecting from the facade at that
 * floor's level, with a metal (or glass) railing or a masonry one.
 */
export interface Balcony {
  id: string;
  /** Floor index it serves (1 or higher); the slab top is at that floor's level. */
  floor: number;
  /** Distance from the facade's left end (seen from outside) to the balcony. */
  offset: number;
  width: number;
  /** How far the slab projects from the facade. */
  depth: number;
  /** Thickness of the slab edge. */
  slab: number;
  railing: "metal" | "solid";
  railingHeight: number;
}

export interface Facade {
  /** Finish system id (see systems.ts), or null when no work is planned. */
  systemId: string | null;
  /** Reinforcing mesh (rrjetë) embedded in a base coat. Always on for systems that include it. */
  mesh: boolean;
  openings: Opening[];
  balconies: Balcony[];
}

export interface Roof {
  type: RoofType;
  /** Roof pitch in degrees (gable and hip roofs). */
  pitch: number;
  /** Parapet height above the top floor (flat roofs); finished like the facade. */
  parapet: number;
}

export interface Building {
  /** Along facades A and C (outside dimension). */
  length: number;
  /** Along facades B and D (outside dimension). */
  width: number;
  /** Floor-to-floor height of each floor, ground floor first. */
  floors: number[];
  roof: Roof;
}

export interface StudioProject {
  version: 2;
  name: string;
  building: Building;
  facades: Record<FacadeId, Facade>;
  /** Insulation board thickness in centimetres (systems with insulation). */
  insulationCm: number;
  /** Depth of the window and door reveals that are finished too; 0 leaves them out. */
  revealDepth: number;
  /** Render colour used in the previews (illustrative only). */
  renderColor: string;
  /** Extra material ordered on top of the calculated quantity, in percent. */
  reservePercent: number;
}

/** What a layer does in the build-up; drives the drawings and the 3D cutaway. */
export type LayerRole = "bond" | "basecoat" | "primer" | "finish";

/** One layer of a finish system: a product and how many coats or passes. */
export interface SystemStep {
  productSlug: string;
  coats: number;
  role: LayerRole;
}

export interface FinishSystem {
  id: string;
  /** Layers in the order they are applied. */
  steps: SystemStep[];
  /** Insulation boards are bonded between the `bond` and `basecoat` layers. */
  insulation: boolean;
  /** "included": the system always has a meshed base coat; "optional": `meshCoat` is added when chosen. */
  mesh: "included" | "optional";
  /** Base coat that embeds the mesh when an optional mesh is chosen. */
  meshCoat?: SystemStep;
}

/** Published coverage: square metres covered by one kilogram, per coat. */
export interface Coverage {
  minM2PerKg: number;
  maxM2PerKg: number;
}

export interface ProductTechnicalData {
  slug: string;
  packSizesKg: number[];
  /** null when Dekorfix has not published a coverage rate yet. */
  coverage: Coverage | null;
}
