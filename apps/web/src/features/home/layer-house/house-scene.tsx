"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  IcosahedronGeometry,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  NeutralToneMapping,
  Path,
  Plane,
  PlaneGeometry,
  Quaternion,
  Shape,
  Vector3,
  type BufferGeometry,
  type Material,
  type Texture,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { layerProgress } from "../layer-progress";
import {
  bagTexture,
  blocksTexture,
  boardsTexture,
  groundTexture,
  meshTexture,
  paversTexture,
  plasterTexture,
  renderTextures,
  roofTexture,
  woodTexture,
} from "./textures";

/*
 * A two-storey house built up with the Dekorfix layers as the section is
 * scrolled: aerated-concrete blocks, then primer, insulation boards, mesh in
 * a base coat, levelling plaster and the finish render, each rising up the
 * walls from the ground. Scaffolding and a pallet of material stand by while
 * the work goes on; with the finished house they are gone, the garden is
 * planted and the lights come on. The house turns slowly all the while.
 *
 * Illustrative only: proportions and thicknesses are typical, not a project.
 * Units are metres.
 */

const L = 10; // length (x)
const W = 8; // depth (z)
const H = 6; // eaves height: two storeys
const RISE = 2.4; // gable roof, ridge along x
const BLOCK = 0.3;

/** The coats over the blocks, in order, as offsets from the block face. */
const COATS = [
  { o: 0, t: 0.012 }, // 01 primer
  { o: 0.012, t: 0.12 }, // 02 adhesive + insulation boards
  { o: 0.132, t: 0.006 }, // 03 mesh in the base coat
  { o: 0.138, t: 0.008 }, // 04 levelling plaster
  { o: 0.146, t: 0.006 }, // 05 finish render
] as const;
const OUT = 0.152;
/** Highest point a coat reaches (the gable apex), so a coat's progress maps to its height. */
const TOP = H + RISE + 0.3;

type Opening = { x: number; y: number; w: number; h: number; kind?: "door" | "tall" };
type FacadeId = "front" | "back" | "right" | "left";

const OPENINGS: Record<FacadeId, Opening[]> = {
  front: [
    { x: 0, y: 0, w: 1.2, h: 2.3, kind: "door" },
    { x: -3.1, y: 0.9, w: 1.6, h: 1.4 },
    { x: 3.1, y: 0.9, w: 1.6, h: 1.4 },
    { x: 0, y: 3.1, w: 1.5, h: 2.3, kind: "tall" },
    { x: -3.1, y: 3.9, w: 1.4, h: 1.3 },
    { x: 3.1, y: 3.9, w: 1.4, h: 1.3 },
  ],
  back: [
    { x: -2.4, y: 0, w: 2.6, h: 2.3, kind: "tall" },
    { x: 2.8, y: 0.9, w: 1.2, h: 1.4 },
    { x: -2.4, y: 3.9, w: 1.4, h: 1.3 },
    { x: 0.6, y: 4.4, w: 0.7, h: 0.7 },
    { x: 2.8, y: 3.9, w: 1.4, h: 1.3 },
  ],
  right: [
    { x: -1.8, y: 0.9, w: 1.2, h: 1.4 },
    { x: 1.8, y: 0.9, w: 1.2, h: 1.4 },
    { x: 0, y: 3.9, w: 1.2, h: 1.3 },
    { x: 0, y: 6.7, w: 0.6, h: 0.6 },
  ],
  left: [
    { x: -1.8, y: 0.9, w: 1.2, h: 1.4 },
    { x: 1.8, y: 0.9, w: 1.2, h: 1.4 },
    { x: 0, y: 3.9, w: 1.2, h: 1.3 },
    { x: 0, y: 6.7, w: 0.6, h: 0.6 },
  ],
};

const FACADES: Array<{ id: FacadeId; gable: boolean; matrix: Matrix4 }> = [
  { id: "front", gable: false, matrix: place(0, W / 2, 0) },
  { id: "back", gable: false, matrix: place(0, -W / 2, Math.PI) },
  { id: "right", gable: true, matrix: place(L / 2, 0, Math.PI / 2) },
  { id: "left", gable: true, matrix: place(-L / 2, 0, -Math.PI / 2) },
];

function place(x: number, z: number, rotation: number) {
  return new Matrix4().makeRotationY(rotation).setPosition(x, 0, z);
}

/** A facade's outline at a given offset: a rectangle, or with the gable on the ends. */
function facadeShape(gable: boolean, o: number, t: number, holes: Opening[]) {
  const half = gable ? W / 2 + o : L / 2 + o + t;
  const shape = new Shape();
  shape.moveTo(-half, 0);
  shape.lineTo(half, 0);
  if (gable) {
    // The roof's slope continued out to this coat's edge.
    const edge = H + RISE * (1 - half / (W / 2));
    shape.lineTo(half, edge);
    shape.lineTo(0, H + RISE);
    shape.lineTo(-half, edge);
  } else {
    shape.lineTo(half, H);
    shape.lineTo(-half, H);
  }
  shape.closePath();
  for (const hole of holes) {
    const path = new Path();
    path.moveTo(hole.x - hole.w / 2, hole.y + 0.001);
    path.lineTo(hole.x + hole.w / 2, hole.y + 0.001);
    path.lineTo(hole.x + hole.w / 2, hole.y + hole.h);
    path.lineTo(hole.x - hole.w / 2, hole.y + hole.h);
    path.closePath();
    shape.holes.push(path);
  }
  return shape;
}

/** One coat (or the block wall) all round the house, as a single geometry. */
function shell(o: number, t: number): BufferGeometry {
  const parts = FACADES.map((facade) => {
    const geometry = new ExtrudeGeometry(facadeShape(facade.gable, o, t, OPENINGS[facade.id]), {
      depth: t,
      bevelEnabled: false,
    });
    geometry.translate(0, 0, o);
    geometry.applyMatrix4(facade.matrix);
    return geometry;
  });
  return merged(parts);
}

function merged(parts: BufferGeometry[]): BufferGeometry {
  const geometry = mergeGeometries(parts.map((part) => (part.index ? part.toNonIndexed() : part)));
  for (const part of parts) part.dispose();
  if (!geometry) throw new Error("Could not merge geometries");
  return geometry;
}

const box = (w: number, h: number, d: number, x: number, y: number, z: number) =>
  new BoxGeometry(w, h, d).translate(x, y, z);

/** A round bar between two points. */
function bar(from: Vector3, to: Vector3, radius: number): BufferGeometry {
  const direction = to.clone().sub(from);
  const geometry = new CylinderGeometry(radius, radius, direction.length(), 6);
  const rotation = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());
  geometry.applyMatrix4(new Matrix4().compose(from.clone().add(to).multiplyScalar(0.5), rotation, new Vector3(1, 1, 1)));
  return geometry;
}

/** A clone of a texture repeated over w × h metres of a 0–1 UV face. */
function tiled(texture: Texture, w: number, h: number, size: number) {
  const copy = texture.clone();
  copy.repeat.set(w / size, h / size);
  copy.needsUpdate = true;
  return copy;
}

const standard = (color: string, extra: Partial<ConstructorParameters<typeof MeshStandardMaterial>[0]> = {}) =>
  new MeshStandardMaterial({ color, roughness: 0.85, ...extra });

interface Built {
  root: Group;
  /** One clipping plane per coat: its height follows the coat's progress. */
  planes: Plane[];
  /** Work line at the top edge of the coat being applied. */
  rings: Mesh[];
  /** Scaffolding and material on site: removed for the finished house. */
  works: { group: Group; materials: Material[] };
  garden: Group;
  lawn: MeshStandardMaterial;
  glass: MeshStandardMaterial;
}

const SOIL = new Color("#b7a587");
const LAWN = new Color("#86a861");

function buildHouse(): Built {
  const root = new Group();
  const add = (geometry: BufferGeometry, material: Material, shadows = true) => {
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = shadows;
    mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  };

  /* ---- Walls and coats ---------------------------------------------------------- */

  add(shell(-BLOCK, BLOCK), standard("#ffffff", { map: blocksTexture(), roughness: 0.95 }));

  const planes = COATS.map(() => new Plane(new Vector3(0, -1, 0), -0.01));
  const render = renderTextures();
  const coatMaterials = [
    standard("#e6969a", { map: blocksTexture(), roughness: 0.75 }), // primer: blocks tinted by the red Beton Kontakt
    standard("#ffffff", { map: boardsTexture(), roughness: 0.9 }),
    standard("#ffffff", { map: meshTexture(), roughness: 0.9 }),
    standard("#ffffff", { map: plasterTexture(), roughness: 0.92 }),
    standard("#ffffff", { map: render.map, bumpMap: render.bump, bumpScale: 1.4, roughness: 0.96 }),
  ];
  COATS.forEach((coat, index) => {
    const material = coatMaterials[index];
    if (!material) return;
    material.clippingPlanes = [planes[index] ?? new Plane()];
    material.clipShadows = true;
    add(shell(coat.o, coat.t), material);
  });
  // A darker plinth render along the base, with the finish.
  const plinth = standard("#7d776e", { roughness: 0.9, clippingPlanes: [planes[4] ?? new Plane()] });
  add(
    merged(
      FACADES.map((facade) => {
        const half = facade.gable ? W / 2 + OUT : L / 2 + OUT + 0.012;
        const geometry = box(half * 2, 0.45, 0.012, 0, 0.225, OUT + 0.006);
        geometry.applyMatrix4(facade.matrix);
        return geometry;
      }),
    ),
    plinth,
  );

  // The work line: a thin red band at the top edge of the coat being applied.
  const rings = COATS.map((coat) => {
    const reach = coat.o + coat.t + 0.006;
    const ring = new Mesh(
      merged([
        box(L + reach * 2, 0.035, 0.01, 0, 0, W / 2 + reach),
        box(L + reach * 2, 0.035, 0.01, 0, 0, -W / 2 - reach),
        box(0.01, 0.035, W + reach * 2, L / 2 + reach, 0, 0),
        box(0.01, 0.035, W + reach * 2, -L / 2 - reach, 0, 0),
      ]),
      new MeshStandardMaterial({ color: "#e41e25", emissive: "#e41e25", emissiveIntensity: 0.6 }),
    );
    ring.visible = false;
    root.add(ring);
    return ring;
  });

  /* ---- Windows, doors, balcony ------------------------------------------------------ */

  const frames: BufferGeometry[] = [];
  const panes: BufferGeometry[] = [];
  const sills: BufferGeometry[] = [];
  const F = 0.07;
  const Z = -0.12;
  for (const facade of FACADES) {
    for (const opening of OPENINGS[facade.id]) {
      const { x, y, w, h } = opening;
      const local: BufferGeometry[] = [
        box(w, F, 0.08, x, y + h - F / 2, Z),
        box(F, h, 0.08, x - w / 2 + F / 2, y + h / 2, Z),
        box(F, h, 0.08, x + w / 2 - F / 2, y + h / 2, Z),
      ];
      if (opening.kind !== "door") {
        local.push(box(w, F, 0.08, x, y + F / 2, Z));
        if (w > 1.25) local.push(box(F * 0.8, h - F, 0.07, x, y + h / 2, Z));
        if (opening.kind === "tall") local.push(box(w, F * 0.8, 0.07, x, y + h * 0.72, Z));
        const pane = new PlaneGeometry(w - F * 2, h - F * 2).translate(x, y + h / 2, Z - 0.01);
        pane.applyMatrix4(facade.matrix);
        panes.push(pane);
      }
      if (!opening.kind) {
        const sill = box(w + 0.12, 0.04, 0.36, x, y - 0.02, 0.04);
        sill.applyMatrix4(facade.matrix);
        sills.push(sill);
      }
      for (const part of local) part.applyMatrix4(facade.matrix);
      frames.push(...local);
    }
  }
  add(merged(frames), standard("#f4f4f2", { roughness: 0.5 }));
  add(merged(sills), standard("#9fa3a6", { roughness: 0.4, metalness: 0.5 }));
  const glass = new MeshStandardMaterial({
    color: "#8aa3b1",
    roughness: 0.06,
    metalness: 0.35,
    emissive: "#ffcf8a",
    emissiveIntensity: 0,
  });
  add(merged(panes), glass, false);

  // Front door: wooden leaf, steel handle, lights either side.
  const front = FACADES[0]?.matrix ?? new Matrix4();
  const door = box(1.2 - F * 2, 2.3 - F, 0.06, 0, (2.3 - F) / 2, Z).applyMatrix4(front);
  add(door, standard("#ffffff", { map: tiled(woodTexture(), 1.06, 2.23, 1), roughness: 0.7 }));
  add(box(0.04, 0.5, 0.05, 0.38, 1.05, Z + 0.06).applyMatrix4(front), standard("#c9ccce", { metalness: 0.9, roughness: 0.25 }));
  const lamp = new MeshStandardMaterial({ color: "#fff4d6", emissive: "#ffd88a", emissiveIntensity: 0.4 });
  add(merged([box(0.12, 0.22, 0.1, -0.95, 2.05, OUT + 0.05), box(0.12, 0.22, 0.1, 0.95, 2.05, OUT + 0.05)]).applyMatrix4(front), lamp, false);

  // Balcony over the door: slab, glass railing, steel top rail.
  const balconyZ = W / 2 + OUT;
  add(box(3.4, 0.2, 1.4, 0, 2.98, balconyZ + 0.7), standard("#d9d6cf", { roughness: 0.8 }));
  add(
    merged([
      box(3.44, 0.05, 0.06, 0, 4.12, balconyZ + 1.37),
      box(0.06, 0.05, 1.4, -1.7, 4.12, balconyZ + 0.7),
      box(0.06, 0.05, 1.4, 1.7, 4.12, balconyZ + 0.7),
      box(0.05, 1.04, 0.05, -1.7, 3.6, balconyZ + 1.37),
      box(0.05, 1.04, 0.05, 1.7, 3.6, balconyZ + 1.37),
    ]),
    standard("#3d3f41", { metalness: 0.7, roughness: 0.35 }),
  );
  add(
    merged([
      box(3.36, 0.95, 0.02, 0, 3.58, balconyZ + 1.36),
      box(0.02, 0.95, 1.32, -1.69, 3.58, balconyZ + 0.7),
      box(0.02, 0.95, 1.32, 1.69, 3.58, balconyZ + 0.7),
    ]),
    new MeshStandardMaterial({ color: "#cfe3ea", transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0.2 }),
    false,
  );

  /* ---- Roof ---------------------------------------------------------------------- */

  const angle = Math.atan(RISE / (W / 2));
  const ridgeY = H + RISE + 0.15;
  const span = W / 2 + OUT + 0.55; // eaves overhang beyond the finish
  const slope = span / Math.cos(angle);
  const roofLength = L + (OUT + 0.5) * 2;
  const tiles = new MeshStandardMaterial({ map: tiled(roofTexture(), roofLength, slope, 1.2), roughness: 0.8, color: "#ffffff" });
  for (const side of [1, -1]) {
    const geometry = new BoxGeometry(roofLength, 0.15, slope);
    const rotation = new Matrix4().makeRotationX(side * angle);
    const direction = new Vector3(0, -Math.sin(angle), side * Math.cos(angle));
    const normal = new Vector3(0, Math.cos(angle), side * Math.sin(angle));
    const center = new Vector3(0, ridgeY, 0).addScaledVector(direction, slope / 2).addScaledVector(normal, -0.075);
    geometry.applyMatrix4(rotation).translate(center.x, center.y, center.z);
    add(geometry, tiles);
  }
  const eavesY = ridgeY - span * Math.tan(angle);
  const trim = standard("#f2f1ed", { roughness: 0.6 });
  // Ridge cap, fascia boards and the boards along the gables.
  add(bar(new Vector3(-roofLength / 2, ridgeY + 0.02, 0), new Vector3(roofLength / 2, ridgeY + 0.02, 0), 0.09), standard("#8e3d27", { roughness: 0.8 }));
  const boards: BufferGeometry[] = [
    box(roofLength, 0.24, 0.04, 0, eavesY - 0.07, span + 0.02),
    box(roofLength, 0.24, 0.04, 0, eavesY - 0.07, -span - 0.02),
  ];
  for (const x of [-roofLength / 2 - 0.02, roofLength / 2 + 0.02]) {
    for (const side of [1, -1]) {
      const from = new Vector3(x, ridgeY - 0.05, 0);
      const to = new Vector3(x, eavesY - 0.05, side * (span + 0.02));
      const geometry = new BoxGeometry(0.04, 0.24, from.distanceTo(to));
      geometry.applyMatrix4(new Matrix4().makeRotationX(side * angle)).translate(x, (from.y + to.y) / 2, (from.z + to.z) / 2);
      boards.push(geometry);
    }
  }
  add(merged(boards), trim);
  // Gutters along the eaves, downpipes at the corners.
  const metal = standard("#8d9296", { metalness: 0.6, roughness: 0.35 });
  const gutters: BufferGeometry[] = [];
  for (const side of [1, -1]) {
    gutters.push(bar(new Vector3(-roofLength / 2, eavesY - 0.16, side * (span + 0.09)), new Vector3(roofLength / 2, eavesY - 0.16, side * (span + 0.09)), 0.075));
    for (const x of [-L / 2 + 0.25, L / 2 - 0.25]) {
      gutters.push(bar(new Vector3(x, 0.05, side * (W / 2 + OUT + 0.07)), new Vector3(x, eavesY - 0.3, side * (W / 2 + OUT + 0.07)), 0.045));
      gutters.push(bar(new Vector3(x, eavesY - 0.3, side * (W / 2 + OUT + 0.07)), new Vector3(x, eavesY - 0.16, side * (span + 0.09)), 0.045));
    }
  }
  add(merged(gutters), metal);
  // Chimney through the back slope.
  const chimneyZ = -1.2;
  const roofAtChimney = ridgeY - Math.abs(chimneyZ) * Math.tan(angle);
  const chimneyTop = roofAtChimney + 1.1;
  add(box(0.75, chimneyTop - H, 0.75, -L / 4, (chimneyTop + H) / 2, chimneyZ), standard("#ffffff", { map: render.map, roughness: 0.95 }));
  add(box(0.95, 0.08, 0.95, -L / 4, chimneyTop + 0.04, chimneyZ), standard("#4d4a46"));

  /* ---- Ground ---------------------------------------------------------------------- */

  const ground = groundTexture();
  ground.repeat.set(140 / 3, 140 / 3);
  const lawn = new MeshStandardMaterial({ color: SOIL.clone(), map: ground, roughness: 1 });
  const groundMesh = new Mesh(new CircleGeometry(70, 72).rotateX(-Math.PI / 2), lawn);
  groundMesh.receiveShadow = true;
  root.add(groundMesh);
  const pavers = paversTexture();
  const terrace = L + OUT * 2 + 1.8;
  const terraceDepth = W + OUT * 2 + 1.8;
  add(box(terrace, 0.04, terraceDepth, 0, 0.02, 0), new MeshStandardMaterial({ map: tiled(pavers, terrace, terraceDepth, 1.2), roughness: 0.9 }), false);
  add(box(1.6, 0.04, 5.2, 0, 0.021, terraceDepth / 2 + 2.6), new MeshStandardMaterial({ map: tiled(pavers, 1.6, 5.2, 1.2), roughness: 0.9 }), false);

  // Trees already on the plot.
  const bark = standard("#6b4a33");
  const leaves = standard("#5f8a45", { flatShading: true, roughness: 0.9 });
  for (const [x, z, scale] of [
    [-L / 2 - 3.4, W / 2 + 1.6, 1],
    [-L / 2 - 2.6, -W / 2 - 3, 1.25],
    [L / 2 + 4.2, -W / 2 - 3.6, 0.9],
  ] as const) {
    const tree = new Group();
    tree.add(new Mesh(new CylinderGeometry(0.12, 0.17, 1.8, 7).translate(0, 0.9, 0), bark));
    tree.add(new Mesh(new IcosahedronGeometry(1.15, 1).translate(0, 2.4, 0), leaves));
    tree.add(new Mesh(new IcosahedronGeometry(0.8, 1).translate(0.2, 3.3, -0.1), leaves));
    tree.traverse((child) => {
      child.castShadow = true;
    });
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);
    root.add(tree);
  }

  // Planted with the finished house: shrubs along the front, lights by the path.
  const garden = new Group();
  const shrubs = standard("#4f7d3a", { flatShading: true, roughness: 0.9 });
  const flowers = standard("#d9576b", { flatShading: true });
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const x = side * (1.6 + i * 1.05);
      const size = 0.38 + ((i * 7) % 3) * 0.06;
      const shrub = new Mesh(new IcosahedronGeometry(size, 1).translate(x, size * 0.8, terraceDepth / 2 + 0.55), i % 3 === 1 ? flowers : shrubs);
      shrub.castShadow = true;
      garden.add(shrub);
    }
    garden.add(new Mesh(box(0.08, 0.7, 0.08, side * 1.1, 0.35, terraceDepth / 2 + 2.2), standard("#3d3f41", { metalness: 0.6 })));
    garden.add(new Mesh(box(0.14, 0.14, 0.14, side * 1.1, 0.75, terraceDepth / 2 + 2.2), lamp));
  }
  garden.scale.setScalar(0.001);
  root.add(garden);

  /* ---- The works: scaffolding and a pallet of material --------------------------------- */

  const works = new Group();
  const steel = new MeshStandardMaterial({ color: "#9aa1a6", metalness: 0.6, roughness: 0.4, transparent: true });
  const planks = new MeshStandardMaterial({ color: "#c49a5c", roughness: 0.85, transparent: true });
  const tubes: BufferGeometry[] = [];
  const decks: BufferGeometry[] = [];
  const levels = [1.9, 3.8, 5.6];
  const scaffoldTop = 6.7;
  // Along the right gable end (x+) and the back (z−).
  const runs = [
    { along: "z", fixed: L / 2 + OUT + 0.35, from: -W / 2 - 0.4, to: W / 2 + 0.4, bays: 4, out: 1 },
    { along: "x", fixed: -(W / 2 + OUT + 0.35), from: -L / 2 - 0.4, to: L / 2 + 1.2, bays: 5, out: -1 },
  ] as const;
  for (const run of runs) {
    const point = (a: number, b: number, y: number) =>
      run.along === "z" ? new Vector3(b, y, a) : new Vector3(a, y, b);
    const inner = run.fixed;
    const outer = run.fixed + run.out * 0.75;
    const step = (run.to - run.from) / run.bays;
    for (let i = 0; i <= run.bays; i++) {
      const a = run.from + i * step;
      for (const b of [inner, outer]) tubes.push(bar(point(a, b, 0), point(a, b, scaffoldTop), 0.03));
      for (const y of levels) tubes.push(bar(point(a, inner, y), point(a, outer, y), 0.025));
      if (i < run.bays) {
        const next = a + step;
        // Bracing on the outer face, alternating.
        tubes.push(bar(point(i % 2 ? a : next, outer, 0.2), point(i % 2 ? next : a, outer, levels[1] ?? 3.8), 0.022));
      }
    }
    for (const y of [...levels, scaffoldTop - 0.05]) {
      for (const b of [inner, outer]) tubes.push(bar(point(run.from, b, y), point(run.to, b, y), 0.025));
    }
    for (const y of levels) tubes.push(bar(point(run.from, outer, y + 1), point(run.to, outer, y + 1), 0.022)); // guard rail
    for (const y of levels) {
      const middle = point((run.from + run.to) / 2, (inner + outer) / 2, y + 0.04);
      const length = run.to - run.from;
      decks.push(run.along === "z" ? box(0.72, 0.05, length, middle.x, middle.y, middle.z) : box(length, 0.05, 0.72, middle.x, middle.y, middle.z));
    }
  }
  const scaffold = new Mesh(merged(tubes), steel);
  const deck = new Mesh(merged(decks), planks);
  scaffold.castShadow = true;
  deck.castShadow = true;
  works.add(scaffold, deck);

  // A pallet of Dekorfix bags and buckets by the front corner.
  const crate = new MeshStandardMaterial({ color: "#a77d4f", roughness: 0.9, transparent: true });
  const bags = new MeshStandardMaterial({ map: bagTexture(), roughness: 0.7, transparent: true });
  const buckets = new MeshStandardMaterial({ color: "#8f1d3a", roughness: 0.5, transparent: true });
  const palletAt = new Vector3(L / 2 + 2.4, 0, W / 2 + 2.2);
  works.add(new Mesh(box(1.25, 0.14, 1.05, palletAt.x, 0.07, palletAt.z), crate));
  const stack: BufferGeometry[] = [];
  for (let layer = 0; layer < 3; layer++) {
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 3; row++) {
        stack.push(box(0.58, 0.14, 0.32, palletAt.x - 0.3 + col * 0.6, 0.21 + layer * 0.145, palletAt.z - 0.34 + row * 0.34));
      }
    }
  }
  works.add(new Mesh(merged(stack), bags));
  works.add(
    new Mesh(
      merged([0, 1, 2].map((i) => new CylinderGeometry(0.17, 0.15, 0.36, 16).translate(palletAt.x - 1.2 + i * 0.12, 0.18, palletAt.z + 0.5 - i * 0.42))),
      buckets,
    ),
  );
  works.traverse((child) => {
    child.castShadow = true;
  });
  root.add(works);

  return { root, planes, rings, works: { group: works, materials: [steel, planks, crate, bags, buckets] }, garden, lawn, glass };
}

/** Everything the house allocates on the GPU, released when the section unmounts. */
function dispose(root: Group) {
  root.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.geometry.dispose();
    const materials: Material[] = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      for (const value of Object.values(material)) if (value && typeof value === "object" && "isTexture" in value) (value as Texture).dispose();
      material.dispose();
    }
  });
}

interface Motion {
  /** Each step's progress as shown, eased towards the scroll position. */
  shown: number[];
  /** The slow turn so far, in radians. */
  turn: number;
  /** Reduced motion: no turning of its own. */
  still: boolean;
}

/** One frame: coats up to their progress, works cleared and garden planted at the end, the turn. */
function animate(built: Built, motion: Motion, rawDelta: number) {
  const delta = Math.min(rawDelta, 0.1);
  const target = layerProgress.values;
  const steps = COATS.length + 1;
  const values = motion.shown;
  // Ease towards the scroll position, so fast scrolling still builds smoothly.
  for (let i = 0; i < steps; i++) {
    const goal = target[i] ?? 0;
    values[i] = (values[i] ?? 0) + (goal - (values[i] ?? 0)) * Math.min(1, delta * 5);
  }

  COATS.forEach((_, index) => {
    const value = values[index] ?? 0;
    const level = value <= 0.002 ? -0.01 : value * TOP;
    const plane = built.planes[index];
    if (plane) plane.constant = level;
    const ring = built.rings[index];
    if (ring) {
      ring.visible = value > 0.01 && value < 0.99 && level < H;
      ring.position.y = level;
    }
  });

  const done = values[COATS.length] ?? 0;
  const away = Math.min(1, done * 1.6);
  for (const material of built.works.materials) material.opacity = 1 - away;
  built.works.group.visible = away < 0.999;
  built.works.group.position.y = -away * 0.4;
  built.garden.scale.setScalar(Math.max(0.001, done));
  built.lawn.color.copy(SOIL).lerp(LAWN, done);
  built.glass.emissiveIntensity = done * 0.1;

  // A slow turn, plus about half a turn over the whole section, so every side is seen.
  if (!motion.still) motion.turn += delta * 0.13;
  const overall = values.reduce((sum, value) => sum + value, 0) / steps;
  built.root.rotation.y = -0.55 + motion.turn + overall * Math.PI * 1.1;
}

function House() {
  const built = useMemo(() => buildHouse(), []);
  const motion = useRef<Motion>({ shown: [], turn: 0, still: false });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      motion.current.still = query.matches;
    };
    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      dispose(built.root);
    };
  }, [built]);

  useFrame((_, delta) => animate(built, motion.current, delta));

  return <primitive object={built.root} />;
}

/** The canvas: soft daylight, one shadow-casting sun. Rendering stops while `active` is false. */
export default function HouseScene({ active }: { active: boolean }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 30, position: [0, 9.5, 29], near: 0.5, far: 120 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = NeutralToneMapping;
        gl.localClippingEnabled = true; // the coats rise up the walls
        camera.lookAt(0, 3.4, 0);
      }}
      aria-hidden
    >
      {/* The ground fades into the sky behind (the frame's background) instead of ending at an edge. */}
      <fog attach="fog" args={["#eef1f0", 34, 72]} />
      <hemisphereLight args={["#ffffff", "#d8cdb9", 1.7]} />
      <directionalLight
        position={[9, 15, 10]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-10, 6, -8]} intensity={0.5} color="#dfe8f0" />
      <House />
    </Canvas>
  );
}
