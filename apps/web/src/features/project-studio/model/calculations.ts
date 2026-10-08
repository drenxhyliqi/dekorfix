/**
 * Pure geometry and quantity calculations for Project Studio. No runtime
 * imports (types only), so the module runs as-is under `node --test`.
 */
import type {
  Balcony,
  Building,
  FacadeId,
  FinishSystem,
  Opening,
  ProductTechnicalData,
  StudioProject,
  SystemStep,
} from "./types";

export const FACADE_IDS: FacadeId[] = ["A", "B", "C", "D"];
export const MAX_FLOORS = 5;

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Facades A and C run along the building length, B and D along its width. */
export function facadeLength(building: Building, facade: FacadeId): number {
  return facade === "A" || facade === "C" ? building.length : building.width;
}

/** Height of the walls from the ground to the top of the highest floor. */
export function wallHeight(building: Building): number {
  return building.floors.reduce((sum, h) => sum + h, 0);
}

/** Level of a floor above the ground. */
export function floorLevel(building: Building, floor: number): number {
  return building.floors.slice(0, floor).reduce((sum, h) => sum + h, 0);
}

/** The ridge runs along the longer side, so the gable ends sit on the shorter facades. */
export function ridgeAlongLength(building: Building): boolean {
  return building.length >= building.width;
}

/** Height of the roof above the walls (gable and hip roofs share the pitch). */
export function roofRise(building: Building): number {
  if (building.roof.type === "flat") return 0;
  const span = Math.min(building.length, building.width);
  return (span / 2) * Math.tan((building.roof.pitch * Math.PI) / 180);
}

export function isGableEnd(building: Building, facade: FacadeId): boolean {
  if (building.roof.type !== "gable") return false;
  const shortSide = ridgeAlongLength(building) ? ["B", "D"] : ["A", "C"];
  return shortSide.includes(facade);
}

/**
 * Outline of the finished facade in facade coordinates [s, z] (s along the
 * facade from its left end, z up from the ground): the walls, plus the
 * parapet of a flat roof or the gable triangle of a gable end.
 */
export function facadeOutline(building: Building, facade: FacadeId): Array<[number, number]> {
  const len = facadeLength(building, facade);
  const H = wallHeight(building);
  if (building.roof.type === "flat") {
    const top = H + building.roof.parapet;
    return [[0, 0], [len, 0], [len, top], [0, top]];
  }
  if (isGableEnd(building, facade)) {
    return [[0, 0], [len, 0], [len, H], [len / 2, H + roofRise(building)], [0, H]];
  }
  return [[0, 0], [len, 0], [len, H], [0, H]];
}

export function openingArea(opening: Opening): number {
  return opening.width * opening.height;
}

/** Reveal strip around an opening: both sides and the head (windows get a sill board below). */
export function revealLength(opening: Opening): number {
  return 2 * opening.height + opening.width;
}

/** Thickness of a masonry balcony railing. */
export const RAILING_THICKNESS = 0.12;

/**
 * Finished surfaces of a balcony: the slab edge (front and both sides), the
 * underside, and for a masonry railing its outer face, inner face and top.
 * A metal or glass railing adds nothing. The wall behind stays facade.
 */
export function balconyArea(balcony: Balcony): number {
  const { width: w, depth: d, slab } = balcony;
  let area = (w + 2 * d) * slab + w * d;
  if (balcony.railing === "solid") {
    const t = RAILING_THICKNESS;
    const outer = w + 2 * d;
    const inner = Math.max(w - 2 * t, 0) + 2 * Math.max(d - t, 0);
    area += (outer + inner) * balcony.railingHeight + (outer - 2 * t) * t;
  }
  return area;
}

export interface FacadeArea {
  /** Walls plus parapet or gable. */
  gross: number;
  openings: number;
  /** Gross minus openings. */
  net: number;
  /** Finished reveals around the openings. */
  reveals: number;
  /** Slab edges, undersides and masonry railings of the balconies. */
  balconies: number;
  /** Net plus reveals plus balconies: the area that gets the finish. */
  total: number;
}

export function facadeArea(project: StudioProject, facade: FacadeId): FacadeArea {
  const { building } = project;
  const len = facadeLength(building, facade);
  let gross = len * wallHeight(building);
  if (building.roof.type === "flat") gross += len * building.roof.parapet;
  if (isGableEnd(building, facade)) gross += (len * roofRise(building)) / 2;
  const openings = project.facades[facade].openings;
  const holes = openings.reduce((sum, o) => sum + openingArea(o), 0);
  const reveals = Math.max(project.revealDepth, 0) * openings.reduce((sum, o) => sum + revealLength(o), 0);
  const net = Math.max(gross - holes, 0);
  const balconies = project.facades[facade].balconies.reduce((sum, b) => sum + balconyArea(b), 0);
  return {
    gross: round2(gross),
    openings: round2(holes),
    net: round2(net),
    reveals: round2(reveals),
    balconies: round2(balconies),
    total: round2(net + reveals + balconies),
  };
}

/** The layers a facade actually gets: the system's steps, plus the mesh base coat when chosen. */
export function effectiveSteps(system: FinishSystem, mesh: boolean): SystemStep[] {
  if (system.mesh === "optional" && mesh && system.meshCoat) return [system.meshCoat, ...system.steps];
  return system.steps;
}

export function hasMesh(system: FinishSystem | undefined, mesh: boolean): boolean {
  if (!system) return false;
  return system.mesh === "included" || mesh;
}

/** Problems with an opening's placement on its facade (empty when valid). */
export function openingIssues(project: StudioProject, facade: FacadeId, opening: Opening): string[] {
  const issues: string[] = [];
  const { building } = project;
  const length = facadeLength(building, facade);
  const floorHeight = building.floors[opening.floor] ?? 0;
  if (opening.width <= 0 || opening.height <= 0) issues.push("size");
  if (opening.floor < 0 || opening.floor >= building.floors.length) issues.push("floor");
  if (opening.offset < 0 || opening.offset + opening.width > length + 1e-9) issues.push("outside-length");
  if (opening.sill < 0 || opening.sill + opening.height > floorHeight + 1e-9) issues.push("outside-height");
  const overlaps = project.facades[facade].openings.some(
    (other) =>
      other.id !== opening.id &&
      other.floor === opening.floor &&
      opening.offset < other.offset + other.width &&
      other.offset < opening.offset + opening.width &&
      opening.sill < other.sill + other.height &&
      other.sill < opening.sill + opening.height,
  );
  if (overlaps) issues.push("overlap");
  return issues;
}

/** Keeps an opening on an existing floor and inside its facade after a resize or drag. */
export function clampOpening(building: Building, facade: FacadeId, opening: Opening): Opening {
  const length = facadeLength(building, facade);
  const floor = Math.min(Math.max(Math.round(opening.floor), 0), building.floors.length - 1);
  const floorHeight = building.floors[floor] ?? 2.5;
  const width = Math.min(Math.max(opening.width, 0.1), length);
  const height = Math.min(Math.max(opening.height, 0.1), floorHeight);
  const offset = Math.min(Math.max(opening.offset, 0), length - width);
  const sill = opening.kind === "door" ? 0 : Math.min(Math.max(opening.sill, 0), floorHeight - height);
  return { ...opening, floor, width: round2(width), height: round2(height), offset: round2(offset), sill: round2(sill) };
}

/** Problems with a balcony's placement (empty when valid). */
export function balconyIssues(project: StudioProject, facade: FacadeId, balcony: Balcony): string[] {
  const issues: string[] = [];
  const length = facadeLength(project.building, facade);
  if (balcony.floor < 1 || balcony.floor >= project.building.floors.length) issues.push("floor");
  if (balcony.offset < 0 || balcony.offset + balcony.width > length + 1e-9) issues.push("outside-length");
  const overlaps = project.facades[facade].balconies.some(
    (other) =>
      other.id !== balcony.id &&
      other.floor === balcony.floor &&
      balcony.offset < other.offset + other.width &&
      other.offset < balcony.offset + balcony.width,
  );
  if (overlaps) issues.push("overlap");
  return issues;
}

/** Keeps a balcony on an upper floor, inside its facade and within sensible sizes. */
export function clampBalcony(building: Building, facade: FacadeId, balcony: Balcony): Balcony {
  const length = facadeLength(building, facade);
  const floor = Math.min(Math.max(Math.round(balcony.floor), 1), building.floors.length - 1);
  const width = Math.min(Math.max(balcony.width, 0.6), length);
  return {
    ...balcony,
    floor,
    width: round2(width),
    offset: round2(Math.min(Math.max(balcony.offset, 0), length - width)),
    depth: round2(Math.min(Math.max(balcony.depth, 0.3), 3)),
    slab: round2(Math.min(Math.max(balcony.slab, 0.1), 0.4)),
    railingHeight: round2(Math.min(Math.max(balcony.railingHeight, 0.8), 1.3)),
  };
}

export interface ProductLine {
  productSlug: string;
  /** Finished area × coats, before reserve. */
  coatedArea: number;
  facades: FacadeId[];
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

/** Materials counted by area rather than by weight. */
export interface AreaLine {
  key: "insulation" | "mesh";
  /** Area the material covers, before reserve. */
  area: number;
  /** Area to order: area plus reserve. */
  orderArea: number;
  facades: FacadeId[];
  /** Mesh only: diagonal reinforcement pieces at the corners of openings. */
  cornerPieces?: number;
}

export interface Estimate {
  lines: ProductLine[];
  areaLines: AreaLine[];
  /** Areas of every facade that has a finish system. */
  facades: Array<{ id: FacadeId; area: FacadeArea; systemId: string }>;
  totalArea: number;
}

/**
 * Material estimate: for every facade with a finish system, each layer adds
 * `finished area × coats` to its product. Products with published coverage
 * are converted to kilograms (range from the coverage range) and whole packs
 * of the largest pack size, with the reserve added to the upper estimate.
 * Insulation boards cover the net wall; the mesh also wraps into the reveals
 * and covers the balconies, which are rendered but not insulated.
 */
export function estimateProject(
  project: StudioProject,
  systems: Record<string, FinishSystem>,
  technical: Record<string, ProductTechnicalData>,
): Estimate {
  const lines = new Map<string, { coatedArea: number; facades: Set<FacadeId> }>();
  const facades: Estimate["facades"] = [];
  const insulation = { area: 0, facades: [] as FacadeId[] };
  const mesh = { area: 0, facades: [] as FacadeId[], corners: 0 };

  for (const id of FACADE_IDS) {
    const facade = project.facades[id];
    const system = facade.systemId ? systems[facade.systemId] : undefined;
    if (!facade.systemId || !system) continue;
    const area = facadeArea(project, id);
    if (area.total <= 0) continue;
    facades.push({ id, area, systemId: facade.systemId });
    for (const step of effectiveSteps(system, facade.mesh)) {
      const line = lines.get(step.productSlug) ?? { coatedArea: 0, facades: new Set<FacadeId>() };
      // Balconies get the render build-up but no insulation boards, so no board adhesive.
      const covered = step.role === "bond" ? area.total - area.balconies : area.total;
      line.coatedArea += covered * step.coats;
      line.facades.add(id);
      lines.set(step.productSlug, line);
    }
    if (system.insulation) {
      insulation.area += area.net;
      insulation.facades.push(id);
    }
    if (hasMesh(system, facade.mesh)) {
      mesh.area += area.total;
      mesh.facades.push(id);
      mesh.corners += facade.openings.reduce((sum, o) => sum + (o.kind === "window" ? 4 : 2), 0);
    }
  }

  const reserve = 1 + Math.max(project.reservePercent, 0) / 100;
  const result: ProductLine[] = [...lines.entries()].map(([productSlug, line]) => {
    const data = technical[productSlug];
    const coatedArea = round2(line.coatedArea);
    if (!data?.coverage || data.packSizesKg.length === 0) {
      return { productSlug, coatedArea, facades: [...line.facades], quantity: null };
    }
    const minKg = coatedArea / data.coverage.maxM2PerKg;
    const maxKg = coatedArea / data.coverage.minM2PerKg;
    const orderKg = maxKg * reserve;
    const packSizeKg = Math.max(...data.packSizesKg);
    return {
      productSlug,
      coatedArea,
      facades: [...line.facades],
      quantity: {
        minKg: round2(minKg),
        maxKg: round2(maxKg),
        orderKg: round2(orderKg),
        packSizeKg,
        packs: Math.ceil(orderKg / packSizeKg - 1e-9),
      },
    };
  });

  const areaLines: AreaLine[] = [];
  if (insulation.facades.length > 0) {
    areaLines.push({
      key: "insulation",
      area: round2(insulation.area),
      orderArea: round2(insulation.area * reserve),
      facades: insulation.facades,
    });
  }
  if (mesh.facades.length > 0) {
    areaLines.push({
      key: "mesh",
      area: round2(mesh.area),
      orderArea: round2(mesh.area * reserve),
      facades: mesh.facades,
      cornerPieces: mesh.corners,
    });
  }

  return {
    lines: result,
    areaLines,
    facades,
    totalArea: round2(facades.reduce((sum, f) => sum + f.area.total, 0)),
  };
}
