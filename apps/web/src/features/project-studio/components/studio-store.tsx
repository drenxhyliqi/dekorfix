"use client";

import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";

import { clampBalcony, clampOpening, FACADE_IDS, facadeLength, MAX_FLOORS } from "../model/calculations";
import { createDefaultProject, finishSystems } from "../model/systems";
import type { Balcony, Building, FacadeId, Opening, Roof, StudioProject } from "../model/types";

/** v2: the studio plans a house's facades (v1 planned one interior room). */
const STORAGE_KEY = "dekorfix:project-studio:v2";

export type StudioView = "plan" | "elevation" | "3d";

export interface StudioState {
  project: StudioProject;
  selected: FacadeId;
  /** Floor whose openings are being edited (and shown in the plan). */
  floor: number;
  view: StudioView;
  /** 3D: peel the facades back to show each layer of the build-up. */
  layers: boolean;
}

export type StudioAction =
  | { type: "size"; patch: Partial<Pick<Building, "length" | "width">> }
  | { type: "floors"; count: number }
  | { type: "floorHeight"; floor: number; height: number }
  | { type: "roof"; patch: Partial<Roof> }
  | { type: "select"; facade: FacadeId }
  | { type: "selectFloor"; floor: number }
  | { type: "view"; view: StudioView }
  | { type: "layers"; on: boolean }
  | { type: "system"; facade: FacadeId; systemId: string | null }
  | { type: "mesh"; facade: FacadeId; on: boolean }
  | { type: "applyToAll"; facade: FacadeId }
  | { type: "addOpening"; facade: FacadeId; floor: number; kind: Opening["kind"]; offset?: number }
  | { type: "updateOpening"; facade: FacadeId; id: string; patch: Partial<Opening> }
  | { type: "removeOpening"; facade: FacadeId; id: string }
  | { type: "copyFloor"; facade: FacadeId; floor: number }
  | { type: "addBalcony"; facade: FacadeId; floor: number }
  | { type: "updateBalcony"; facade: FacadeId; id: string; patch: Partial<Balcony> }
  | { type: "removeBalcony"; facade: FacadeId; id: string }
  | { type: "insulation"; cm: number }
  | { type: "reveal"; depth: number }
  | { type: "renderColor"; color: string }
  | { type: "reserve"; percent: number }
  | { type: "rename"; name: string }
  | { type: "reset"; name: string };

const OPENING_DEFAULTS: Record<Opening["kind"], Omit<Opening, "id" | "offset" | "floor">> = {
  door: { kind: "door", width: 1, height: 2.2, sill: 0 },
  window: { kind: "window", width: 1.2, height: 1.4, sill: 0.9 },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
let idCounter = 0;
const newId = (kind: Opening["kind"] | "balcony") => `${kind[0]}${Date.now().toString(36)}${(idCounter++).toString(36)}`;

function withOpenings(project: StudioProject, facade: FacadeId, openings: Opening[]): StudioProject {
  return { ...project, facades: { ...project.facades, [facade]: { ...project.facades[facade], openings } } };
}

function withBalconies(project: StudioProject, facade: FacadeId, balconies: Balcony[]): StudioProject {
  return { ...project, facades: { ...project.facades, [facade]: { ...project.facades[facade], balconies } } };
}

/** Re-fits every opening and balcony after the building changes; those on removed floors go. */
function refit(project: StudioProject): StudioProject {
  let next = project;
  const floors = next.building.floors.length;
  for (const facade of FACADE_IDS) {
    const openings = next.facades[facade].openings
      .filter((o) => o.floor < floors)
      .map((o) => clampOpening(next.building, facade, o));
    const balconies = next.facades[facade].balconies
      .filter((b) => b.floor >= 1 && b.floor < floors)
      .map((b) => clampBalcony(next.building, facade, b));
    next = withBalconies(withOpenings(next, facade, openings), facade, balconies);
  }
  return next;
}

function withBuilding(state: StudioState, building: Building): StudioState {
  return {
    ...state,
    project: refit({ ...state.project, building }),
    floor: Math.min(state.floor, building.floors.length - 1),
  };
}

function reducer(state: StudioState, action: StudioAction): StudioState {
  const { project } = state;
  const { building } = project;
  switch (action.type) {
    case "size": {
      const next = { ...building };
      if (action.patch.length !== undefined && Number.isFinite(action.patch.length)) next.length = clamp(action.patch.length, 3, 60);
      if (action.patch.width !== undefined && Number.isFinite(action.patch.width)) next.width = clamp(action.patch.width, 3, 60);
      return withBuilding(state, next);
    }
    case "floors": {
      const count = clamp(Math.round(action.count), 1, MAX_FLOORS);
      const floors = building.floors.slice(0, count);
      while (floors.length < count) floors.push(floors[floors.length - 1] ?? 2.9);
      const next = withBuilding(state, { ...building, floors });
      if (count <= building.floors.length) return next;
      // A new floor starts with the windows (and balconies) of the floor below it, as on most houses.
      const top = building.floors.length - 1;
      const facades = { ...next.project.facades };
      for (const id of FACADE_IDS) {
        const below = facades[id].openings.filter((o) => o.floor === top && o.kind === "window");
        const belowBalconies = facades[id].balconies.filter((b) => b.floor === top);
        const added: Opening[] = [];
        const addedBalconies: Balcony[] = [];
        for (let floor = top + 1; floor < count; floor++) {
          added.push(...below.map((o) => clampOpening(next.project.building, id, { ...o, id: newId(o.kind), floor })));
          addedBalconies.push(...belowBalconies.map((b) => ({ ...b, id: newId("balcony"), floor })));
        }
        facades[id] = {
          ...facades[id],
          openings: [...facades[id].openings, ...added],
          balconies: [...facades[id].balconies, ...addedBalconies],
        };
      }
      return { ...next, project: { ...next.project, facades } };
    }
    case "floorHeight": {
      if (!Number.isFinite(action.height)) return state;
      const floors = building.floors.map((h, i) => (i === action.floor ? clamp(action.height, 2.2, 6) : h));
      return withBuilding(state, { ...building, floors });
    }
    case "roof": {
      const roof = { ...building.roof, ...action.patch };
      roof.pitch = clamp(Number.isFinite(roof.pitch) ? roof.pitch : 30, 5, 60);
      roof.parapet = clamp(Number.isFinite(roof.parapet) ? roof.parapet : 0, 0, 2);
      return withBuilding(state, { ...building, roof });
    }
    case "select":
      return { ...state, selected: action.facade };
    case "selectFloor":
      return { ...state, floor: clamp(action.floor, 0, building.floors.length - 1) };
    case "view":
      return { ...state, view: action.view };
    case "layers":
      return { ...state, layers: action.on };
    case "system": {
      const facade = project.facades[action.facade];
      return {
        ...state,
        project: { ...project, facades: { ...project.facades, [action.facade]: { ...facade, systemId: action.systemId } } },
      };
    }
    case "mesh": {
      const facade = project.facades[action.facade];
      return {
        ...state,
        project: { ...project, facades: { ...project.facades, [action.facade]: { ...facade, mesh: action.on } } },
      };
    }
    case "applyToAll": {
      const { systemId, mesh } = project.facades[action.facade];
      const facades = { ...project.facades };
      for (const id of FACADE_IDS) facades[id] = { ...facades[id], systemId, mesh };
      return { ...state, project: { ...project, facades } };
    }
    case "addOpening": {
      const defaults = OPENING_DEFAULTS[action.kind];
      const length = facadeLength(building, action.facade);
      if (defaults.width > length) return state;
      const onFloor = project.facades[action.facade].openings.filter((o) => o.floor === action.floor);
      const opening = clampOpening(building, action.facade, {
        ...defaults,
        id: newId(action.kind),
        floor: action.floor,
        offset: action.offset ?? freeOffset(onFloor, length, defaults.width),
      });
      return { ...state, project: withOpenings(project, action.facade, [...project.facades[action.facade].openings, opening]) };
    }
    case "updateOpening": {
      const openings = project.facades[action.facade].openings.map((o) =>
        o.id === action.id ? clampOpening(building, action.facade, { ...o, ...action.patch }) : o,
      );
      return { ...state, project: withOpenings(project, action.facade, openings) };
    }
    case "removeOpening":
      return {
        ...state,
        project: withOpenings(
          project,
          action.facade,
          project.facades[action.facade].openings.filter((o) => o.id !== action.id),
        ),
      };
    case "copyFloor": {
      // Same window layout on every floor: replace the other floors' openings with copies.
      // Doors are copied too (balcony doors); they stay on the floor level.
      const source = project.facades[action.facade].openings.filter((o) => o.floor === action.floor);
      const copies = building.floors.flatMap((_, floor) =>
        floor === action.floor
          ? source
          : source.map((o) => clampOpening(building, action.facade, { ...o, id: newId(o.kind), floor })),
      );
      // Balconies are copied to the upper floors only.
      const balconies = project.facades[action.facade].balconies;
      const sourceBalconies = balconies.filter((b) => b.floor === action.floor);
      const balconyCopies =
        action.floor === 0
          ? balconies
          : building.floors.flatMap((_, floor) =>
              floor === 0 ? [] : floor === action.floor ? sourceBalconies : sourceBalconies.map((b) => ({ ...b, id: newId("balcony"), floor })),
            );
      return {
        ...state,
        project: withBalconies(withOpenings(project, action.facade, copies), action.facade, balconyCopies),
      };
    }
    case "addBalcony": {
      if (action.floor < 1) return state;
      const length = facadeLength(building, action.facade);
      const width = Math.min(3, length);
      const balcony = clampBalcony(building, action.facade, {
        id: newId("balcony"),
        floor: action.floor,
        offset: (length - width) / 2,
        width,
        depth: 1.2,
        slab: 0.2,
        railing: "metal",
        railingHeight: 1,
      });
      return {
        ...state,
        project: withBalconies(project, action.facade, [...project.facades[action.facade].balconies, balcony]),
      };
    }
    case "updateBalcony": {
      const balconies = project.facades[action.facade].balconies.map((b) =>
        b.id === action.id ? clampBalcony(building, action.facade, { ...b, ...action.patch }) : b,
      );
      return { ...state, project: withBalconies(project, action.facade, balconies) };
    }
    case "removeBalcony":
      return {
        ...state,
        project: withBalconies(
          project,
          action.facade,
          project.facades[action.facade].balconies.filter((b) => b.id !== action.id),
        ),
      };
    case "insulation":
      return Number.isFinite(action.cm) ? { ...state, project: { ...project, insulationCm: clamp(Math.round(action.cm), 2, 30) } } : state;
    case "reveal":
      return Number.isFinite(action.depth) ? { ...state, project: { ...project, revealDepth: clamp(action.depth, 0, 0.6) } } : state;
    case "renderColor":
      return { ...state, project: { ...project, renderColor: action.color } };
    case "reserve":
      return { ...state, project: { ...project, reservePercent: clamp(action.percent, 0, 30) } };
    case "rename":
      return { ...state, project: { ...project, name: action.name.slice(0, 80) } };
    case "reset":
      return { ...state, project: createDefaultProject(action.name), selected: "A", floor: 0 };
  }
}

/** First gap along the facade wide enough for a new opening (centred if the floor is empty). */
function freeOffset(openings: Opening[], length: number, width: number): number {
  if (openings.length === 0) return (length - width) / 2;
  const sorted = [...openings].sort((a, b) => a.offset - b.offset);
  let cursor = 0.5;
  for (const o of sorted) {
    if (o.offset - cursor >= width + 0.3) return cursor;
    cursor = Math.max(cursor, o.offset + o.width + 0.5);
  }
  return cursor;
}

/** Plans saved before balconies existed have none. */
function normalize(project: StudioProject): StudioProject {
  const facades = { ...project.facades };
  for (const id of FACADE_IDS) facades[id] = { ...facades[id], balconies: facades[id].balconies ?? [] };
  return { ...project, facades };
}

function isProject(value: unknown): value is StudioProject {
  const p = value as StudioProject | null;
  return (
    p?.version === 2 &&
    Array.isArray(p.building?.floors) &&
    p.building.floors.length > 0 &&
    FACADE_IDS.every((id) => Array.isArray(p.facades?.[id]?.openings)) &&
    FACADE_IDS.every((id) => p.facades[id].systemId === null || p.facades[id].systemId in finishSystems)
  );
}

function loadProject(defaultName: string): StudioProject {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (isProject(parsed)) return normalize(parsed);
    }
  } catch {
    // Storage unavailable (private mode, blocked): start fresh.
  }
  return createDefaultProject(defaultName);
}

const StudioContext = createContext<{ state: StudioState; dispatch: Dispatch<StudioAction> } | null>(null);

/** Client-only provider (the studio is rendered without SSR, so localStorage is available here). */
export function StudioProvider({ defaultName, children }: { defaultName: string; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultName, (name) => ({
    project: loadProject(name),
    selected: "A" as FacadeId,
    floor: 0,
    view: "3d" as StudioView,
    layers: false,
  }));

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
        // The interior-room plan from the first version can no longer be opened.
        window.localStorage.removeItem("dekorfix:project-studio:v1");
      } catch {
        // Ignore: saving is a convenience.
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [state.project]);

  return <StudioContext.Provider value={{ state, dispatch }}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used inside <StudioProvider>.");
  return context;
}
