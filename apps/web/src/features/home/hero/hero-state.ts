/**
 * Mutable state shared between the hero's DOM layer and its WebGL scene.
 * Written by scroll/pointer listeners, read every frame by the scene, so it
 * deliberately lives outside React state (no re-renders per frame).
 */
export const heroState = {
  /** 0 at the top of the hero, 1 when its pinned sequence has finished. */
  progress: 0,
  /** Pointer position in the hero, -1…1 on each axis (0 = centre). */
  pointer: { x: 0, y: 0 },
  /** True when the visitor prefers reduced motion. */
  reducedMotion: false,
};
