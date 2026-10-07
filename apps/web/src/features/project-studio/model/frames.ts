import type { StudioProject, WallId } from "./types";

/** Wall thickness used in the drawings and 3D view (illustrative). */
export const WALL_THICKNESS = 0.2;

export interface WallFrame {
  /** Interior corner at the wall's left end, seen from inside the room (plan coordinates). */
  origin: { x: number; y: number };
  /** Unit vector along the wall, from its left end to its right end. */
  along: { x: number; y: number };
  /** Unit vector pointing into the room. */
  inward: { x: number; y: number };
  length: number;
}

/**
 * Plan coordinates: x to the right (along the room length), y down (along the
 * width). Wall A is at the top, then clockwise B (right), C (bottom), D (left).
 * Offsets of openings are measured from the wall's left end as seen from
 * inside the room, so every view places openings identically.
 */
export function wallFrame(project: StudioProject, wall: WallId): WallFrame {
  const { length: L, width: W } = project.room;
  switch (wall) {
    case "A":
      return { origin: { x: 0, y: 0 }, along: { x: 1, y: 0 }, inward: { x: 0, y: 1 }, length: L };
    case "B":
      return { origin: { x: L, y: 0 }, along: { x: 0, y: 1 }, inward: { x: -1, y: 0 }, length: W };
    case "C":
      return { origin: { x: L, y: W }, along: { x: -1, y: 0 }, inward: { x: 0, y: -1 }, length: L };
    case "D":
      return { origin: { x: 0, y: W }, along: { x: 0, y: -1 }, inward: { x: 1, y: 0 }, length: W };
  }
}

/** Point at distance `s` along the wall and `depth` outwards (positive = into the wall). */
export function wallPoint(frame: WallFrame, s: number, depth = 0): { x: number; y: number } {
  return {
    x: frame.origin.x + frame.along.x * s - frame.inward.x * depth,
    y: frame.origin.y + frame.along.y * s - frame.inward.y * depth,
  };
}
