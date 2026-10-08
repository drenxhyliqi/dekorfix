import { effectiveSteps, hasMesh } from "../model/calculations";
import { finishSystems } from "../model/systems";
import type { FacadeId, LayerRole, StudioProject } from "../model/types";

export type LayerKind = "masonry" | "insulation" | "mesh" | LayerRole;

export interface FacadeLayer {
  kind: LayerKind;
  /** Dekorfix product applied in this layer, if any. */
  productSlug?: string;
  /** Thickness in the 3D view (thin coats are exaggerated so they read). */
  thickness: number;
  color: string;
}

/** Colours of the build-up in the 3D view and its legend (illustrative). */
export const LAYER_COLORS: Record<Exclude<LayerKind, "finish">, string> = {
  masonry: "#d8d3c8",
  bond: "#a8a499",
  insulation: "#f6f5f0",
  basecoat: "#bdb8ae",
  mesh: "#e0773c",
  primer: "#ede8dc",
};

const THICKNESS: Record<Exclude<LayerKind, "masonry" | "insulation">, number> = {
  bond: 0.016,
  basecoat: 0.01,
  mesh: 0.003,
  primer: 0.004,
  finish: 0.01,
};

/**
 * Layers of one facade from the outer face of the masonry outwards, in the
 * order they are applied: adhesive, insulation boards, base coat with the
 * mesh embedded, primer, render. The masonry itself is not included.
 */
export function facadeLayers(project: StudioProject, facade: FacadeId): FacadeLayer[] {
  const state = project.facades[facade];
  const system = state.systemId ? finishSystems[state.systemId] : undefined;
  if (!system) return [];
  const layers: FacadeLayer[] = [];
  for (const step of effectiveSteps(system, state.mesh)) {
    const color = step.role === "finish" ? project.renderColor : LAYER_COLORS[step.role];
    layers.push({ kind: step.role, productSlug: step.productSlug, thickness: THICKNESS[step.role], color });
    if (step.role === "bond" && system.insulation) {
      layers.push({ kind: "insulation", thickness: project.insulationCm / 100, color: LAYER_COLORS.insulation });
    }
    if (step.role === "basecoat" && hasMesh(system, state.mesh)) {
      layers.push({ kind: "mesh", thickness: THICKNESS.mesh, color: LAYER_COLORS.mesh });
    }
  }
  return layers;
}

/** Total thickness added outside the masonry. */
export function layersDepth(layers: FacadeLayer[]): number {
  return layers.reduce((sum, layer) => sum + layer.thickness, 0);
}
