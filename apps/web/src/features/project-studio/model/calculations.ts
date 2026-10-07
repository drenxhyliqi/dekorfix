/**
 * Pure geometry and quantity calculations for Project Studio. No runtime
 * imports (types only), so the module runs as-is under `node --test`.
 */
import type {
  FinishSystem,
  Opening,
  ProductTechnicalData,
  StudioProject,
  SurfaceId,
  SurfaceKind,
  WallId,
} from "./types";

export const WALL_IDS: WallId[] = ["A", "B", "C", "D"];
export const SURFACE_IDS: SurfaceId[] = [...WALL_IDS, "floor", "ceiling"];

const round2 = (value: number) => Math.round(value * 100) / 100;

export function surfaceKind(id: SurfaceId): SurfaceKind {
  return id === "floor" || id === "ceiling" ? id : "wall";
}

/** Walls A and C run along the room length, B and D along its width. */
export function wallLength(project: StudioProject, wall: WallId): number {
  return wall === "A" || wall === "C" ? project.room.length : project.room.width;
}

export function openingArea(opening: Opening): number {
  return opening.width * opening.height;
}

export interface SurfaceArea {
  gross: number;
  openings: number;
  net: number;
}

export function surfaceArea(project: StudioProject, id: SurfaceId): SurfaceArea {
  if (id === "floor" || id === "ceiling") {
    const area = project.room.length * project.room.width;
    return { gross: round2(area), openings: 0, net: round2(area) };
  }
  const gross = wallLength(project, id) * project.room.height;
  const openings = project.walls[id].openings.reduce((sum, o) => sum + openingArea(o), 0);
  return { gross: round2(gross), openings: round2(openings), net: round2(Math.max(gross - openings, 0)) };
}

export function systemFor(project: StudioProject, id: SurfaceId): string | null {
  if (id === "floor") return project.floor.systemId;
  if (id === "ceiling") return project.ceiling.systemId;
  return project.walls[id].systemId;
}

/** Problems with an opening's placement on its wall (empty when valid). */
export function openingIssues(project: StudioProject, wall: WallId, opening: Opening): string[] {
  const issues: string[] = [];
  const length = wallLength(project, wall);
  if (opening.width <= 0 || opening.height <= 0) issues.push("size");
  if (opening.offset < 0 || opening.offset + opening.width > length + 1e-9) issues.push("outside-length");
  if (opening.sill < 0 || opening.sill + opening.height > project.room.height + 1e-9) issues.push("outside-height");
  const overlaps = project.walls[wall].openings.some(
    (other) =>
      other.id !== opening.id &&
      opening.offset < other.offset + other.width &&
      other.offset < opening.offset + opening.width &&
      opening.sill < other.sill + other.height &&
      other.sill < opening.sill + opening.height,
  );
  if (overlaps) issues.push("overlap");
  return issues;
}

/** Keeps an opening inside its wall after a resize or drag. */
export function clampOpening(project: StudioProject, wall: WallId, opening: Opening): Opening {
  const length = wallLength(project, wall);
  const width = Math.min(Math.max(opening.width, 0.1), length);
  const height = Math.min(Math.max(opening.height, 0.1), project.room.height);
  const offset = Math.min(Math.max(opening.offset, 0), length - width);
  const sill = opening.kind === "door" ? 0 : Math.min(Math.max(opening.sill, 0), project.room.height - height);
  return { ...opening, width: round2(width), height: round2(height), offset: round2(offset), sill: round2(sill) };
}

export interface ProductLine {
  productSlug: string;
  /** Surface area × coats, before reserve. */
  coatedArea: number;
  surfaces: SurfaceId[];
  /** null when coverage data is not published yet. */
  quantity: {
    minKg: number;
    maxKg: number;
    /** Kilograms to order: the upper estimate plus reserve. */
    orderKg: number;
    packSizeKg: number;
    packs: number;
  } | null;
}

export interface Estimate {
  lines: ProductLine[];
  /** Net area per surface that has a finish system. */
  surfaces: Array<{ id: SurfaceId; area: SurfaceArea; systemId: string }>;
  totalArea: number;
}

/**
 * Material estimate: for every surface with a finish system, each step adds
 * `net area × coats` to its product. Products with published coverage are
 * converted to kilograms (range from the coverage range) and whole packs of
 * the largest pack size, with the reserve added to the upper estimate.
 */
export function estimateProject(
  project: StudioProject,
  systems: Record<string, FinishSystem>,
  technical: Record<string, ProductTechnicalData>,
): Estimate {
  const lines = new Map<string, { coatedArea: number; surfaces: Set<SurfaceId> }>();
  const surfaces: Estimate["surfaces"] = [];

  for (const id of SURFACE_IDS) {
    const systemId = systemFor(project, id);
    const system = systemId ? systems[systemId] : undefined;
    if (!systemId || !system) continue;
    const area = surfaceArea(project, id);
    if (area.net <= 0) continue;
    surfaces.push({ id, area, systemId });
    for (const step of system.steps) {
      const line = lines.get(step.productSlug) ?? { coatedArea: 0, surfaces: new Set<SurfaceId>() };
      line.coatedArea += area.net * step.coats;
      line.surfaces.add(id);
      lines.set(step.productSlug, line);
    }
  }

  const reserve = 1 + Math.max(project.reservePercent, 0) / 100;
  const result: ProductLine[] = [...lines.entries()].map(([productSlug, line]) => {
    const data = technical[productSlug];
    const coatedArea = round2(line.coatedArea);
    if (!data?.coverage || data.packSizesKg.length === 0) {
      return { productSlug, coatedArea, surfaces: [...line.surfaces], quantity: null };
    }
    const minKg = coatedArea / data.coverage.maxM2PerKg;
    const maxKg = coatedArea / data.coverage.minM2PerKg;
    const orderKg = maxKg * reserve;
    const packSizeKg = Math.max(...data.packSizesKg);
    return {
      productSlug,
      coatedArea,
      surfaces: [...line.surfaces],
      quantity: {
        minKg: round2(minKg),
        maxKg: round2(maxKg),
        orderKg: round2(orderKg),
        packSizeKg,
        packs: Math.ceil(orderKg / packSizeKg - 1e-9),
      },
    };
  });

  return {
    lines: result,
    surfaces,
    totalArea: round2(surfaces.reduce((sum, s) => sum + s.area.net, 0)),
  };
}
