/**
 * Scroll progress of the "layer by layer" section, shared between LayerWatcher
 * (which measures it) and the 3D house (which reads it every frame). A plain
 * object rather than React state, so scrolling never re-renders anything.
 */
export const layerProgress = {
  /** One value per step (the layers, then the finished house), each 0 → 1. */
  values: [] as number[],
  /** The current step. */
  active: 0,
};
