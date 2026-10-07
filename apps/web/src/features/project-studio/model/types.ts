/**
 * Project Studio domain model. A project is one rectangular room with four
 * walls (A–D, clockwise from the top of the plan), a floor and a ceiling.
 * All measurements are in metres.
 */

export type WallId = "A" | "B" | "C" | "D";
export type SurfaceId = WallId | "floor" | "ceiling";
export type SurfaceKind = "wall" | "floor" | "ceiling";

export interface Opening {
  id: string;
  kind: "door" | "window";
  /** Distance from the wall's left end (seen from inside the room) to the opening. */
  offset: number;
  width: number;
  height: number;
  /** Height of the bottom edge above the floor (0 for doors). */
  sill: number;
}

export interface SurfaceFinish {
  /** Finish system id (see systems.ts), or null when no work is planned. */
  systemId: string | null;
}

export interface WallSurface extends SurfaceFinish {
  openings: Opening[];
}

export interface Room {
  /** Along walls A and C. */
  length: number;
  /** Along walls B and D. */
  width: number;
  height: number;
}

export interface StudioProject {
  version: 1;
  name: string;
  room: Room;
  walls: Record<WallId, WallSurface>;
  floor: SurfaceFinish;
  ceiling: SurfaceFinish;
  /** Wall colour used for painted surfaces in the previews (illustrative only). */
  paintColor: string;
  /** Extra material ordered on top of the calculated quantity, in percent. */
  reservePercent: number;
}

/** One layer of a finish system: a product and how many coats or passes. */
export interface SystemStep {
  productSlug: string;
  coats: number;
}

export interface FinishSystem {
  id: string;
  surfaces: SurfaceKind[];
  steps: SystemStep[];
  /** How the system looks in the previews. */
  appearance: "paint" | "skim" | "plaster" | "tiles" | "largeTiles";
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
