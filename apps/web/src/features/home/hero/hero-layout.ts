/**
 * Where the sack stands in the hero stage, as fractions of the stage size.
 * Shared by the WebGL scene and the CSS (poster, floor line, type) so both
 * line up. Keep in sync with the breakpoint classes in home-hero.tsx:
 *   default → phones and portrait tablets
 *   sm:landscape → landscape tablets
 *   lg → desktop
 */
export interface HeroLayout {
  /** Horizontal centre of the sack, 0–1 from the left. */
  x: number;
  /** The floor the sack stands on, 0–1 from the top. */
  floor: number;
  /** Sack height as a fraction of the stage height. */
  height: number;
}

export function heroLayout(viewportWidth: number, viewportHeight: number): HeroLayout {
  if (viewportWidth >= 1024) return { x: 0.69, floor: 0.78, height: 0.64 };
  if (viewportWidth >= 640 && viewportWidth > viewportHeight) return { x: 0.7, floor: 0.77, height: 0.6 };
  return { x: 0.5, floor: 0.86, height: 0.44 };
}
