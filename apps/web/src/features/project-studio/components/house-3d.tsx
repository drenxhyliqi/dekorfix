"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Matrix4,
  MeshStandardMaterial,
  NeutralToneMapping,
  Plane,
  RepeatWrapping,
  Shape,
  SRGBColorSpace,
  Vector3,
  type PerspectiveCamera,
  type Texture,
} from "three";

import { ROOF_COLOR } from "./elevation-view";
import { facadeLayers, LAYER_COLORS, layersDepth } from "./facade-layers";
import {
  FACADE_IDS,
  facadeOutline,
  floorLevel,
  isGableEnd,
  ridgeAlongLength,
  roofRise,
  wallHeight,
} from "../model/calculations";
import { WALL_THICKNESS as T, facadeFrame, type FacadeFrame } from "../model/frames";
import type { Balcony, Building, FacadeId, Opening, StudioProject } from "../model/types";

const BRAND = "#e41e25";
/** Roof overhang beyond the finished facade (illustrative). */
const EAVES = 0.45;

/** Cutaway: each layer starts this much further along the facade than the one beneath it. */
function cutStep(length: number): number {
  return Math.min(Math.max(length * 0.1, 0.45), 0.9);
}

export interface House3DProps {
  project: StudioProject;
  selected: FacadeId;
  /** Peel every facade back in steps to show its build-up. */
  layers: boolean;
  onSelect: (facade: FacadeId) => void;
}

/** Exterior of the house: layered facades, windows and doors, roof. */
export default function House3D({ project, selected, layers, onSelect }: House3DProps) {
  const { building } = project;
  const { length: L, width: W } = building;
  const H = wallHeight(building);
  const span = Math.max(L, W, H);
  const outer = Math.max(0, ...FACADE_IDS.map((id) => layersDepth(facadeLayers(project, id))));
  const textures = useTextures();

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ fov: 30, position: [span, span, span * 1.6], near: 0.1, far: 400 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = NeutralToneMapping; // keeps the render colours true
        gl.localClippingEnabled = true; // layer cutaway
      }}
    >
      <color attach="background" args={["#f6f5f2"]} />
      <hemisphereLight args={["#ffffff", "#e3ddd2", 1.9]} />
      <directionalLight
        position={[span * 0.9, span * 1.6, span * 1.3]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-span * 1.3}
        shadow-camera-right={span * 1.3}
        shadow-camera-top={span * 1.3}
        shadow-camera-bottom={-span * 1.3}
        shadow-camera-far={span * 6}
      />

      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[span * 8, span * 8]} />
        <meshStandardMaterial color="#ecebe5" roughness={1} />
      </mesh>

      <group position={[-L / 2, 0, -W / 2]}>
        {/* Dark interior, seen through the windows */}
        <mesh position={[L / 2, H / 2, W / 2]}>
          <boxGeometry args={[L - 2 * T - 0.02, H - 0.02, W - 2 * T - 0.02]} />
          <meshStandardMaterial color="#5b5853" roughness={1} />
        </mesh>
        {FACADE_IDS.map((id) => (
          <FacadeMesh
            key={id}
            project={project}
            facade={id}
            layered={layers}
            selected={selected === id}
            textures={textures}
            onSelect={onSelect}
          />
        ))}
        <Roof building={building} outer={outer} texture={textures.tiles} />
      </group>

      <CameraRig building={building} selected={selected} layers={layers} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={2.5}
        maxDistance={span * 5}
        minPolarAngle={0.2}
        maxPolarAngle={1.45}
      />
    </Canvas>
  );
}

/**
 * Camera: frames the whole house from the front-right; in layer mode it
 * glides to a close-up of the selected facade's cutaway, seen slightly from
 * the left so the stepped edges of the layers show. Moves only when the
 * house, the canvas, the mode or the facade changes, so orbiting stays free.
 */
function CameraRig({ building, selected, layers }: { building: Building; selected: FacadeId; layers: boolean }) {
  const shotFor = useRef("");
  const flight = useRef<{ from: Vector3; to: Vector3; fromTarget: Vector3; toTarget: Vector3; t: number } | null>(null);
  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const controls = state.controls as unknown as { target?: Vector3; update?: () => void } | null;
    const H = wallHeight(building);
    const height = H + roofRise(building);
    const key = `${building.length}x${building.width}x${height}x${state.size.width}x${state.size.height}x${layers ? selected : "-"}`;

    if (shotFor.current !== key) {
      const first = shotFor.current === "";
      shotFor.current = key;
      const vfov = (camera.fov * Math.PI) / 180;
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * (state.size.width / state.size.height));
      let position: Vector3;
      let target: Vector3;
      if (layers) {
        const frame = facadeFrame(building, selected);
        const focusS = Math.min(frame.length * 0.32, cutStep(frame.length) * 3.5);
        const along = new Vector3(frame.along.x, 0, frame.along.y);
        const outward = new Vector3(frame.outward.x, 0, frame.outward.y);
        target = new Vector3(
          frame.origin.x + frame.along.x * focusS - building.length / 2,
          Math.min(2.4, H * 0.4),
          frame.origin.y + frame.along.y * focusS - building.width / 2,
        );
        const view = Math.min(frame.length * 0.85, 9.5);
        const distance = view / 2 / Math.tan(Math.min(vfov, hfov) / 2);
        position = target.clone().addScaledVector(outward.addScaledVector(along, -0.6).add(new Vector3(0, 0.22, 0)).normalize(), distance);
      } else {
        const radius = Math.hypot(building.length / 2, building.width / 2, height / 2);
        const distance = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.08;
        target = new Vector3(0, height * 0.4, 0);
        position = target.clone().addScaledVector(new Vector3(0.55, 0.42, 0.78).normalize(), distance);
      }
      const fromTarget = controls?.target?.clone() ?? target.clone();
      flight.current = first
        ? { from: position, to: position, fromTarget: target, toTarget: target, t: 1 }
        : { from: camera.position.clone(), to: position, fromTarget, toTarget: target, t: 0 };
      if (first) {
        camera.position.copy(position);
        controls?.target?.copy(target);
        controls?.update?.();
        camera.lookAt(target);
      }
    }

    const f = flight.current;
    if (!f || f.t >= 1) return;
    f.t = Math.min(f.t + delta / 0.9, 1);
    const eased = 1 - Math.pow(1 - f.t, 3);
    camera.position.lerpVectors(f.from, f.to, eased);
    controls?.target?.lerpVectors(f.fromTarget, f.toTarget, eased);
    controls?.update?.();
  });
  return null;
}

/* ---- Textures (canvas, generated once per mount) --------------------------------------- */

interface Textures {
  blocks: Texture;
  eps: Texture;
  mesh: Texture;
  grain: Texture;
  tiles: Texture;
}

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void, metres: [number, number]): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  // Geometry UVs are in metres, so one repeat per texture tile size.
  texture.repeat.set(1 / metres[0], 1 / metres[1]);
  texture.anisotropy = 8;
  return texture;
}

/** Small seeded generator so the textures look the same on every visit. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createTextures(): Textures {
  const random = seeded(7);
  {
    // Aerated concrete blocks, 60 × 25 cm, running bond (2 × 4 blocks per tile).
    const blocks = canvasTexture(
      256,
      256,
      (ctx) => {
        for (let row = 0; row < 4; row++) {
          for (let col = -1; col < 3; col++) {
            const x = col * 128 + (row % 2) * 64;
            const shade = 214 + ((row * 7 + col * 13) % 5) * 3;
            ctx.fillStyle = `rgb(${shade} ${shade - 4} ${shade - 12})`;
            ctx.fillRect(x, row * 64, 128, 64);
            ctx.strokeStyle = "#b7b0a2";
            ctx.lineWidth = 3;
            ctx.strokeRect(x + 1.5, row * 64 + 1.5, 125, 61);
          }
        }
      },
      [1.2, 1],
    );
    // Insulation boards, 100 × 50 cm.
    const eps = canvasTexture(
      256,
      128,
      (ctx) => {
        ctx.fillStyle = "#f7f6f1";
        ctx.fillRect(0, 0, 256, 128);
        for (let i = 0; i < 700; i++) {
          ctx.fillStyle = `rgba(200,196,186,${random() * 0.35})`;
          ctx.fillRect(random() * 256, random() * 128, 2, 2);
        }
        ctx.strokeStyle = "#d9d5ca";
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 254, 126);
      },
      [1, 0.5],
    );
    // Reinforcing mesh: open grid (transparent between threads), shown at 8 cm so it reads at house scale.
    const mesh = canvasTexture(
      64,
      64,
      (ctx) => {
        ctx.clearRect(0, 0, 64, 64);
        ctx.fillStyle = LAYER_COLORS.mesh;
        ctx.fillRect(0, 0, 64, 7);
        ctx.fillRect(0, 0, 7, 64);
      },
      [0.08, 0.08],
    );
    // Fine render grain, multiplied with the chosen colour.
    const grain = canvasTexture(
      128,
      128,
      (ctx) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 2600; i++) {
          const v = 228 + Math.floor(random() * 27);
          ctx.fillStyle = `rgb(${v} ${v} ${v})`;
          ctx.fillRect(random() * 128, random() * 128, 1.5, 1.5);
        }
      },
      [0.5, 0.5],
    );
    // Roof tiles: courses of 33 cm, staggered joints every 30 cm.
    const tiles = canvasTexture(
      128,
      128,
      (ctx) => {
        ctx.fillStyle = ROOF_COLOR;
        ctx.fillRect(0, 0, 128, 128);
        const g = ctx.createLinearGradient(0, 0, 0, 64);
        g.addColorStop(0, "rgba(255,255,255,0.08)");
        g.addColorStop(1, "rgba(60,25,15,0.28)");
        for (let row = 0; row < 2; row++) {
          ctx.save();
          ctx.translate(0, row * 64);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 128, 64);
          ctx.fillStyle = "rgba(70,30,20,0.35)";
          for (const x of row ? [32, 96] : [0, 64]) ctx.fillRect(x, 0, 2, 64);
          ctx.restore();
        }
      },
      [0.6, 0.66],
    );
    return { blocks, eps, mesh, grain, tiles };
  }
}

function useTextures(): Textures {
  const textures = useMemo(() => createTextures(), []);
  useEffect(() => () => Object.values(textures).forEach((texture) => texture.dispose()), [textures]);
  return textures;
}

/* ---- Facades ------------------------------------------------------------------------------- */

/** Basis that maps facade coordinates (s along, z up, depth outward) into plan space. */
function facadeMatrix(frame: FacadeFrame): Matrix4 {
  const matrix = new Matrix4().makeBasis(
    new Vector3(frame.along.x, 0, frame.along.y),
    new Vector3(0, 1, 0),
    new Vector3(frame.outward.x, 0, frame.outward.y),
  );
  matrix.setPosition(frame.origin.x, 0, frame.origin.y);
  return matrix;
}

/**
 * One slab of the facade: its outline (walls + gable or parapet) stretched by
 * `extend` at both ends to close the corners, with the openings cut out,
 * between `from` and `to` metres outside the masonry face.
 */
function slabGeometry(
  building: Building,
  facade: FacadeId,
  openings: Opening[],
  extend: number,
  from: number,
  to: number,
  frame: FacadeFrame,
): ExtrudeGeometry {
  const len = frame.length;
  const H = wallHeight(building);
  const slope = Math.tan((building.roof.pitch * Math.PI) / 180);
  const gableEnd = isGableEnd(building, facade);
  const outline = facadeOutline(building, facade).map(([s, z]): [number, number] => {
    const at = s <= 0 ? -extend : s >= len ? len + extend : s;
    // Under a pitched roof, keep each slab just below the roof planes so they never cut through them:
    // a gable end follows the slope; elsewhere the top drops with the layer's distance from the wall.
    if (building.roof.type === "flat" || z < H - 1e-9) return [at, z];
    if (gableEnd) return [at, H + (len / 2 - Math.abs(at - len / 2)) * slope - 0.01];
    return [at, H - Math.max(to, 0) * slope - 0.01];
  });
  const shape = new Shape();
  outline.forEach(([s, z], i) => (i === 0 ? shape.moveTo(s, z) : shape.lineTo(s, z)));
  shape.closePath();
  const min = -extend + 0.001;
  const max = len + extend - 0.001;
  for (const o of openings) {
    const a = Math.max(o.offset, min);
    const b = Math.min(o.offset + o.width, max);
    if (b - a < 0.01) continue;
    const z0 = floorLevel(building, o.floor) + o.sill;
    const hole = new Shape();
    hole.moveTo(a, z0);
    hole.lineTo(b, z0);
    hole.lineTo(b, z0 + o.height);
    hole.lineTo(a, z0 + o.height);
    hole.closePath();
    shape.holes.push(hole);
  }
  const geometry = new ExtrudeGeometry(shape, { depth: to - from, bevelEnabled: false });
  geometry.translate(0, 0, from);
  geometry.applyMatrix4(facadeMatrix(frame));
  return geometry;
}

function FacadeMesh({
  project,
  facade,
  layered,
  selected,
  textures,
  onSelect,
}: {
  project: StudioProject;
  facade: FacadeId;
  layered: boolean;
  selected: boolean;
  textures: Textures;
  onSelect: (facade: FacadeId) => void;
}) {
  const { building } = project;
  const frame = facadeFrame(building, facade);
  const openings = project.facades[facade].openings;
  const layers = facadeLayers(project, facade);
  const depth = layersDepth(layers);
  const len = frame.length;
  // World position of the facade origin along its own axis (the house is centred on the origin).
  const originAlong =
    (frame.origin.x - building.length / 2) * frame.along.x + (frame.origin.y - building.width / 2) * frame.along.y;

  const pick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(facade);
  };
  const marker = facadeMatrix(frame).multiply(new Matrix4().makeTranslation(len / 2, 0.012, depth + 0.55));

  return (
    <group onClick={pick}>
      <FacadeSlabs
        building={building}
        facade={facade}
        openings={openings}
        thicknessKey={layers.map((layer) => layer.thickness).join(",")}
        lookKey={layers.map((layer) => `${layer.kind}:${layer.color}`).join("|")}
        layered={layered}
        originAlong={originAlong}
        textures={textures}
      />
      {openings.map((opening) => (
        <OpeningMesh key={opening.id} building={building} frame={frame} opening={opening} outer={depth} />
      ))}
      {project.facades[facade].balconies.map((balcony) => (
        <BalconyMesh
          key={balcony.id}
          building={building}
          frame={frame}
          balcony={balcony}
          outer={depth}
          color={project.facades[facade].systemId ? project.renderColor : "#cfcac0"}
        />
      ))}
      {/* Selected facade: a red line on the ground in front of it. */}
      {selected && !layered && (
        <mesh matrixAutoUpdate={false} matrix={marker}>
          <boxGeometry args={[len, 0.02, 0.08]} />
          <meshBasicMaterial color={BRAND} />
        </mesh>
      )}
    </group>
  );
}

/**
 * The masonry and every layer outside it, each with its own clipping plane.
 * Layers arrive as plain keys ("0.016,0.1,…" and "bond:#a8a499|…") so the
 * geometry is only rebuilt when the build-up or the house changes.
 */
function FacadeSlabs({
  building,
  facade,
  openings,
  thicknessKey,
  lookKey,
  layered,
  originAlong,
  textures,
}: {
  building: Building;
  facade: FacadeId;
  openings: Opening[];
  thicknessKey: string;
  lookKey: string;
  layered: boolean;
  originAlong: number;
  textures: Textures;
}) {
  const geometries = useMemo(() => {
    const frame = facadeFrame(building, facade);
    const endFacade = facade === "A" || facade === "C";
    const thicknesses = thicknessKey ? thicknessKey.split(",").map(Number) : [];
    // Corners: A and C run past the ends to cover them; B and D stop at their inner face.
    const result = [slabGeometry(building, facade, openings, endFacade ? 0 : -T, -T, 0, frame)];
    let from = 0;
    for (const thickness of thicknesses) {
      const to = from + thickness;
      result.push(slabGeometry(building, facade, openings, endFacade ? to : from, from, to, frame));
      from = to;
    }
    return result;
  }, [building, facade, openings, thicknessKey]);
  useEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries]);

  const kinds = lookKey ? lookKey.split("|").map((look) => look.split(":")[0]) : [];
  const materials = useMemo(() => {
    const frame = facadeFrame(building, facade);
    const looks = lookKey ? lookKey.split("|").map((look) => look.split(":")) : [];
    return geometries.map((_, index) => {
      const material = new MeshStandardMaterial({ roughness: 0.92, clipShadows: true, side: DoubleSide });
      if (index === 0) {
        material.map = textures.blocks;
        return material;
      }
      // Keeps the part of the layer beyond its cut along the facade.
      material.clippingPlanes = [new Plane(new Vector3(frame.along.x, 0, frame.along.y), 0)];
      const [kind, color = "#ffffff"] = looks[index - 1] ?? [];
      if (kind === "insulation") {
        material.map = textures.eps;
      } else if (kind === "mesh") {
        material.map = textures.mesh;
        material.alphaTest = 0.5;
      } else if (kind === "finish") {
        material.map = textures.grain;
        material.color.set(color);
        material.roughness = 0.96;
      } else {
        material.color.set(color);
      }
      return material;
    });
  }, [geometries, building, facade, lookKey, textures]);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  const step = cutStep(facadeFrame(building, facade).length);
  const cuts = useRef<number[]>([]);
  useFrame(() => {
    materials.forEach((material, index) => {
      const plane = material.clippingPlanes?.[0];
      if (!plane) return;
      const target = layered ? index * step : -2;
      const current = cuts.current[index] ?? target;
      const next = Math.abs(target - current) < 0.001 ? target : current + (target - current) * 0.12;
      cuts.current[index] = next;
      // Kept where along·p ≥ originAlong + cut.
      plane.constant = -(originAlong + next);
    });
  });

  return geometries.map((geometry, index) => (
    <mesh key={index} geometry={geometry} material={materials[index]} castShadow={kinds[index - 1] !== "mesh"} receiveShadow />
  ));
}

/** Window or door set into the masonry, with an outside sill under windows. */
function OpeningMesh({ building, frame, opening, outer }: { building: Building; frame: FacadeFrame; opening: Opening; outer: number }) {
  const matrix = useMemo(() => {
    const m = facadeMatrix(frame);
    const z = floorLevel(building, opening.floor) + opening.sill + opening.height / 2;
    m.multiply(new Matrix4().makeTranslation(opening.offset + opening.width / 2, z, 0));
    return m;
  }, [building, frame, opening]);
  const w = opening.width;
  const h = opening.height;
  const p = 0.07; // frame profile
  const inset = -0.1; // frame sits inside the reveal
  const frameColor = "#f4f3ef";

  return (
    <group matrixAutoUpdate={false} matrix={matrix}>
      {/* Frame */}
      <mesh position={[0, h / 2 - p / 2, inset]} castShadow>
        <boxGeometry args={[w, p, p]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>
      <mesh position={[0, -h / 2 + p / 2, inset]}>
        <boxGeometry args={[w, p, p]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (w / 2 - p / 2), 0, inset]}>
          <boxGeometry args={[p, h, p]} />
          <meshStandardMaterial color={frameColor} roughness={0.5} />
        </mesh>
      ))}

      {opening.kind === "window" ? (
        <>
          <mesh position={[0, 0, inset]}>
            <boxGeometry args={[w - 2 * p, h - 2 * p, 0.012]} />
            <meshStandardMaterial color="#9fb3bd" roughness={0.06} metalness={0.35} />
          </mesh>
          {w > 0.9 && (
            <mesh position={[0, 0, inset]}>
              <boxGeometry args={[p * 0.9, h - 2 * p, p]} />
              <meshStandardMaterial color={frameColor} roughness={0.5} />
            </mesh>
          )}
          {/* Outside sill */}
          <mesh position={[0, -h / 2 - 0.015, (inset - 0.02 + outer + 0.06) / 2]} castShadow>
            <boxGeometry args={[w + 0.08, 0.03, outer + 0.06 - inset + 0.02]} />
            <meshStandardMaterial color="#c9c6be" roughness={0.6} metalness={0.15} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, -p / 2, inset]}>
            <boxGeometry args={[w - 2 * p, h - p, 0.05]} />
            <meshStandardMaterial color="#5e5a54" roughness={0.55} />
          </mesh>
          <mesh position={[w / 2 - p - 0.12, -0.05, inset + 0.04]}>
            <boxGeometry args={[0.03, 0.22, 0.03]} />
            <meshStandardMaterial color="#d4d1ca" metalness={0.6} roughness={0.3} />
          </mesh>
        </>
      )}
    </group>
  );
}

/**
 * Balcony: the slab runs from the masonry out past the finished face; a
 * masonry railing is rendered like the facade, a metal one has a handrail
 * and balusters. Local axes: x along the facade, y up, z outwards.
 */
function BalconyMesh({
  building,
  frame,
  balcony,
  outer,
  color,
}: {
  building: Building;
  frame: FacadeFrame;
  balcony: Balcony;
  outer: number;
  color: string;
}) {
  const matrix = useMemo(() => {
    const m = facadeMatrix(frame);
    m.multiply(new Matrix4().makeTranslation(balcony.offset + balcony.width / 2, floorLevel(building, balcony.floor), 0));
    return m;
  }, [building, frame, balcony]);
  const { width: w, depth: d, slab, railingHeight: h } = balcony;
  const front = outer + d; // outer edge of the slab
  const t = 0.12; // masonry railing thickness
  const metal = "#4a4844";

  return (
    <group matrixAutoUpdate={false} matrix={matrix}>
      <mesh position={[0, -slab / 2, front / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, slab, front]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {balcony.railing === "solid" ? (
        <>
          <mesh position={[0, h / 2, front - t / 2]} castShadow receiveShadow>
            <boxGeometry args={[w, h, t]} />
            <meshStandardMaterial color={color} roughness={0.95} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * (w / 2 - t / 2), h / 2, outer + (d - t) / 2]} castShadow receiveShadow>
              <boxGeometry args={[t, h, d - t]} />
              <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
          ))}
        </>
      ) : (
        <MetalRailing width={w} depth={d} outer={outer} height={h} color={metal} />
      )}
    </group>
  );
}

function MetalRailing({ width: w, depth: d, outer, height: h, color }: { width: number; depth: number; outer: number; height: number; color: string }) {
  const front = outer + d - 0.04;
  const bar = 0.022;
  const frontBars = Math.max(Math.floor(w / 0.12), 2);
  const sideBars = Math.max(Math.floor(d / 0.12), 1);
  const material = <meshStandardMaterial color={color} metalness={0.55} roughness={0.4} />;
  return (
    <group>
      {/* Handrail and bottom rail, front and sides */}
      {[h, 0.1].map((y) => (
        <group key={y}>
          <mesh position={[0, y, front]} castShadow>
            <boxGeometry args={[w, y === h ? 0.05 : 0.03, y === h ? 0.05 : 0.03]} />
            {material}
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * (w / 2 - 0.03), y, outer + d / 2]} castShadow>
              <boxGeometry args={[y === h ? 0.05 : 0.03, y === h ? 0.05 : 0.03, d]} />
              {material}
            </mesh>
          ))}
        </group>
      ))}
      {Array.from({ length: frontBars + 1 }, (_, i) => (
        <mesh key={`f${i}`} position={[-w / 2 + 0.03 + ((w - 0.06) * i) / frontBars, h / 2, front]} castShadow>
          <boxGeometry args={[bar, h, bar]} />
          {material}
        </mesh>
      ))}
      {[-1, 1].flatMap((side) =>
        Array.from({ length: sideBars }, (_, i) => (
          <mesh key={`s${side}${i}`} position={[side * (w / 2 - 0.03), h / 2, outer + 0.04 + ((d - 0.08) * i) / sideBars]} castShadow>
            <boxGeometry args={[bar, h, bar]} />
            {material}
          </mesh>
        )),
      )}
    </group>
  );
}

/* ---- Roof -------------------------------------------------------------------------------- */

/**
 * Gable or hip roof as tiled planes over the eaves rectangle, built in roof
 * coordinates (u along the ridge, v across it) and mapped to the plan. UVs are
 * in metres along the eaves and up the slope.
 */
function roofGeometry(building: Building, outer: number): BufferGeometry {
  const alongLength = ridgeAlongLength(building);
  const Lr = alongLength ? building.length : building.width;
  const S = alongLength ? building.width : building.length;
  const H = wallHeight(building);
  const slope = Math.tan((building.roof.pitch * Math.PI) / 180);
  const cos = Math.cos((building.roof.pitch * Math.PI) / 180);
  const e = EAVES + outer;
  const half = S / 2;
  // The slopes rest on the masonry: at the wall face (v = 0) the roof is at the top of the walls.
  const ze = H - e * slope;
  const zr = H + roofRise(building);
  const hip = building.roof.type === "hip";
  const r1 = hip ? Math.min(half, Lr / 2) : -e;
  const r2 = hip ? Math.max(Lr - half, Lr / 2) : Lr + e;

  type P = [number, number, number]; // u, v, height
  const c00: P = [-e, -e, ze];
  const c10: P = [Lr + e, -e, ze];
  const c11: P = [Lr + e, S + e, ze];
  const c01: P = [-e, S + e, ze];
  const R1: P = [r1, half, zr];
  const R2: P = [r2, half, zr];

  const positions: number[] = [];
  const uvs: number[] = [];
  const toPlan = ([u, v, z]: P) => (alongLength ? [u, z, v] : [v, z, u]);
  const push = (tri: P[], uv: (p: P) => [number, number]) => {
    for (const p of tri) {
      positions.push(...toPlan(p));
      uvs.push(...uv(p));
    }
  };
  // Long slopes: u along the eaves, v up the slope.
  const slopeUV = (p: P): [number, number] => [p[0], (half + e - Math.abs(p[1] - half)) / cos];
  push([c00, c10, R2], slopeUV);
  push([c00, R2, R1], slopeUV);
  push([c11, c01, R1], slopeUV);
  push([c11, R1, R2], slopeUV);
  if (hip) {
    const endUV = (start: number) => (p: P): [number, number] => [p[1], Math.abs(p[0] - start) / cos];
    push([c01, c00, R1], endUV(-e));
    push([c10, c11, R2], endUV(Lr + e));
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function Roof({ building, outer, texture }: { building: Building; outer: number; texture: Texture }) {
  const H = wallHeight(building);
  const geometry = useMemo(() => (building.roof.type === "flat" ? null : roofGeometry(building, outer)), [building, outer]);
  useEffect(() => () => geometry?.dispose(), [geometry]);

  if (building.roof.type === "flat") {
    const top = H + building.roof.parapet;
    const o = outer + 0.04;
    return (
      <group>
        <mesh rotation-x={-Math.PI / 2} position={[building.length / 2, H + 0.02, building.width / 2]} receiveShadow>
          <planeGeometry args={[building.length - 2 * T, building.width - 2 * T]} />
          <meshStandardMaterial color="#c4c0b6" roughness={1} />
        </mesh>
        {/* Coping on the parapet */}
        {FACADE_IDS.map((id) => {
          const frame = facadeFrame(building, id);
          const end = id === "A" || id === "C";
          const length = end ? frame.length + 2 * o : frame.length - 2 * T;
          const m = facadeMatrix(frame).multiply(new Matrix4().makeTranslation(frame.length / 2, top + 0.03, (o - T) / 2));
          return (
            <mesh key={id} matrixAutoUpdate={false} matrix={m} castShadow>
              <boxGeometry args={[length, 0.06, T + o]} />
              <meshStandardMaterial color="#a7a39b" roughness={0.6} metalness={0.2} />
            </mesh>
          );
        })}
      </group>
    );
  }

  return (
    geometry && (
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial map={texture} side={DoubleSide} roughness={0.8} />
      </mesh>
    )
  );
}
