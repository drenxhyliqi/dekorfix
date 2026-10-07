"use client";

import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";

import { clampOpening, WALL_IDS, wallLength } from "../model/calculations";
import { createDefaultProject } from "../model/systems";
import type { Opening, Room, StudioProject, SurfaceId, WallId } from "../model/types";

const STORAGE_KEY = "dekorfix:project-studio:v1";

export type StudioView = "plan" | "elevation" | "3d";

export interface StudioState {
  project: StudioProject;
  selected: SurfaceId;
  view: StudioView;
}

export type StudioAction =
  | { type: "room"; patch: Partial<Room> }
  | { type: "select"; surface: SurfaceId }
  | { type: "view"; view: StudioView }
  | { type: "system"; surface: SurfaceId; systemId: string | null }
  | { type: "addOpening"; wall: WallId; kind: Opening["kind"] }
  | { type: "updateOpening"; wall: WallId; id: string; patch: Partial<Opening> }
  | { type: "removeOpening"; wall: WallId; id: string }
  | { type: "paintColor"; color: string }
  | { type: "reserve"; percent: number }
  | { type: "rename"; name: string }
  | { type: "reset"; name: string };

const OPENING_DEFAULTS: Record<Opening["kind"], Omit<Opening, "id" | "offset">> = {
  door: { kind: "door", width: 0.9, height: 2.1, sill: 0 },
  window: { kind: "window", width: 1.2, height: 1.4, sill: 0.9 },
};

function withWall(project: StudioProject, wall: WallId, openings: Opening[]): StudioProject {
  return { ...project, walls: { ...project.walls, [wall]: { ...project.walls[wall], openings } } };
}

/** Re-fits every opening after the room changes size. */
function refit(project: StudioProject): StudioProject {
  let next = project;
  for (const wall of WALL_IDS) {
    next = withWall(next, wall, next.walls[wall].openings.map((o) => clampOpening(next, wall, o)));
  }
  return next;
}

function reducer(state: StudioState, action: StudioAction): StudioState {
  const { project } = state;
  switch (action.type) {
    case "room": {
      const room = { ...project.room };
      for (const [key, value] of Object.entries(action.patch) as Array<[keyof Room, number]>) {
        if (Number.isFinite(value)) room[key] = Math.min(Math.max(value, key === "height" ? 2 : 1), 30);
      }
      return { ...state, project: refit({ ...project, room }) };
    }
    case "select":
      return {
        ...state,
        selected: action.surface,
        // The elevation only makes sense for walls.
        view: state.view === "elevation" && (action.surface === "floor" || action.surface === "ceiling") ? "plan" : state.view,
      };
    case "view":
      return {
        ...state,
        view: action.view,
        selected:
          action.view === "elevation" && (state.selected === "floor" || state.selected === "ceiling") ? "A" : state.selected,
      };
    case "system": {
      if (action.surface === "floor") return { ...state, project: { ...project, floor: { systemId: action.systemId } } };
      if (action.surface === "ceiling") return { ...state, project: { ...project, ceiling: { systemId: action.systemId } } };
      const wall = project.walls[action.surface];
      return {
        ...state,
        project: { ...project, walls: { ...project.walls, [action.surface]: { ...wall, systemId: action.systemId } } },
      };
    }
    case "addOpening": {
      const defaults = OPENING_DEFAULTS[action.kind];
      const length = wallLength(project, action.wall);
      if (defaults.width > length) return state;
      const existing = project.walls[action.wall].openings;
      const opening = clampOpening(project, action.wall, {
        ...defaults,
        id: `${action.kind[0]}${Date.now().toString(36)}`,
        offset: freeOffset(existing, length, defaults.width),
      });
      return { ...state, project: withWall(project, action.wall, [...existing, opening]) };
    }
    case "updateOpening": {
      const openings = project.walls[action.wall].openings.map((o) =>
        o.id === action.id ? clampOpening(project, action.wall, { ...o, ...action.patch }) : o,
      );
      return { ...state, project: withWall(project, action.wall, openings) };
    }
    case "removeOpening":
      return {
        ...state,
        project: withWall(project, action.wall, project.walls[action.wall].openings.filter((o) => o.id !== action.id)),
      };
    case "paintColor":
      return { ...state, project: { ...project, paintColor: action.color } };
    case "reserve":
      return { ...state, project: { ...project, reservePercent: Math.min(Math.max(action.percent, 0), 30) } };
    case "rename":
      return { ...state, project: { ...project, name: action.name.slice(0, 80) } };
    case "reset":
      return { ...state, project: createDefaultProject(action.name), selected: "A" };
  }
}

/** First gap along the wall wide enough for a new opening (centred if the wall is empty). */
function freeOffset(openings: Opening[], length: number, width: number): number {
  if (openings.length === 0) return (length - width) / 2;
  const sorted = [...openings].sort((a, b) => a.offset - b.offset);
  let cursor = 0.2;
  for (const o of sorted) {
    if (o.offset - cursor >= width + 0.1) return cursor;
    cursor = Math.max(cursor, o.offset + o.width + 0.2);
  }
  return cursor;
}

function loadProject(defaultName: string): StudioProject {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as StudioProject;
      if (parsed?.version === 1 && parsed.room && parsed.walls) return parsed;
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
    selected: "A" as SurfaceId,
    view: "plan" as StudioView,
  }));

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
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
