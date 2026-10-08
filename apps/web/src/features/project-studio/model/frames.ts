import type { Building, FacadeId } from "./types";

/** Masonry thickness used in the drawings and 3D view (illustrative). */
export const WALL_THICKNESS = 0.25;

export interface FacadeFrame {
  /** Outer corner at the facade's left end, seen from outside (plan coordinates). */
  origin: { x: number; y: number };
  /** Unit vector along the facade, from its left end to its right end. */
  along: { x: number; y: number };
  /** Unit vector pointing away from the house. */
  outward: { x: number; y: number };
  length: number;
}

/**
 * Plan coordinates: x to the right (along the length), y down (along the
 * width); the footprint is [0, length] × [0, width] on the outer face of the
 * masonry. Facade A (front) is at the bottom of the plan, then B (right),
 * C (back) and D (left). Offsets of openings are measured from the facade's
 * left end as seen from outside, so every view places openings identically.
 */
export function facadeFrame(building: Building, facade: FacadeId): FacadeFrame {
  const { length: L, width: W } = building;
  switch (facade) {
    case "A":
      return { origin: { x: 0, y: W }, along: { x: 1, y: 0 }, outward: { x: 0, y: 1 }, length: L };
    case "B":
      return { origin: { x: L, y: W }, along: { x: 0, y: -1 }, outward: { x: 1, y: 0 }, length: W };
    case "C":
      return { origin: { x: L, y: 0 }, along: { x: -1, y: 0 }, outward: { x: 0, y: -1 }, length: L };
    case "D":
      return { origin: { x: 0, y: 0 }, along: { x: 0, y: 1 }, outward: { x: -1, y: 0 }, length: W };
  }
}

/** Point at distance `s` along the facade and `depth` outwards (negative = into the wall). */
export function facadePoint(frame: FacadeFrame, s: number, depth = 0): { x: number; y: number } {
  return {
    x: frame.origin.x + frame.along.x * s + frame.outward.x * depth,
    y: frame.origin.y + frame.along.y * s + frame.outward.y * depth,
  };
}
