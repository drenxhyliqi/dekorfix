"use client";

import { Edges, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  ExtrudeGeometry,
  Matrix4,
  MeshStandardMaterial,
  RepeatWrapping,
  Shape,
  NeutralToneMapping,
  type PerspectiveCamera,
  SRGBColorSpace,
  Vector3,
  type Group,
  type Mesh,
} from "three";

import { tileSize } from "./plan-view";
import { WALL_IDS } from "../model/calculations";
import { WALL_THICKNESS as T, wallFrame } from "../model/frames";
import { finishSystems } from "../model/systems";
import type { StudioProject, SurfaceId, WallId } from "../model/types";

const BRAND = "#e41e25";
const RAW = "#c9c6be"; // untreated substrate

export interface Room3DProps {
  project: StudioProject;
  selected: SurfaceId;
  onSelect: (surface: SurfaceId) => void;
}

/** Dollhouse view: no ceiling, walls nearest the camera fade out. */
export default function Room3D({ project, selected, onSelect }: Room3DProps) {
  const { length: L, width: W, height: H } = project.room;
  const span = Math.max(L, W);
  return (
    <Canvas
      // PCF filtering; three.js no longer supports PCFSoftShadowMap.
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ fov: 32, position: [span * 1.15, span * 1.25 + H, span * 1.55], near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = NeutralToneMapping; // keeps paint colours true
      }}
    >
      <color attach="background" args={["#f6f5f2"]} />
      <hemisphereLight args={["#ffffff", "#e6e1d8", 2.1]} />
      <directionalLight
        position={[span, span * 2, span * 0.8]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-span}
        shadow-camera-right={span}
        shadow-camera-top={span}
        shadow-camera-bottom={-span}
      />
      <group position={[-L / 2, 0, -W / 2]}>
        <Floor project={project} selected={selected === "floor"} onSelect={onSelect} />
        {WALL_IDS.map((wall) => (
          <Wall key={wall} project={project} wall={wall} selected={selected === wall} onSelect={onSelect} />
        ))}
      </group>
      <FitCamera room={project.room} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        target={[0, H * 0.3, 0]}
        minDistance={span * 0.9}
        maxDistance={span * 5}
        minPolarAngle={0.15}
        maxPolarAngle={1.32}
      />
    </Canvas>
  );
}

/**
 * Tile grid texture. Wall UVs are in metres (from the extruded shape), so the
 * default repeat is one tile per `size` metres; the floor plane passes its own.
 */
/**
 * Frames the whole room: places the camera on a fixed 3/4 bearing at the
 * distance where the room's bounding sphere fits the narrower field of view.
 * Runs again whenever the room dimensions change.
 */
function FitCamera({ room }: { room: StudioProject["room"] }) {
  const fittedFor = useRef("");
  const direction = useRef(new Vector3(0.62, 0.62, 0.48).normalize());
  useFrame((state) => {
    const key = `${room.length}x${room.width}x${room.height}x${state.size.width}x${state.size.height}`;
    if (fittedFor.current === key) return;
    fittedFor.current = key;
    const camera = state.camera as PerspectiveCamera;
    const radius = Math.hypot(room.length / 2, room.width / 2, room.height / 2);
    const vfov = (camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * (state.size.width / state.size.height));
    const distance = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.18;
    const target = new Vector3(0, room.height * 0.3, 0);
    camera.position.copy(target).addScaledVector(direction.current, distance);
    camera.lookAt(target);
    const controls = state.controls as unknown as { target?: Vector3; update?: () => void } | null;
    controls?.target?.copy(target);
    controls?.update?.();
  });
  return null;
}

function useTileTexture(size: number | null, base: string, repeat?: [number, number]) {
  const rx = repeat?.[0];
  const ry = repeat?.[1];
  const texture = useMemo(() => {
    if (!size) return null;
    const px = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, px, px);
      ctx.fillStyle = "#b8b3a9";
      ctx.fillRect(0, px - 3, px, 3);
      ctx.fillRect(px - 3, 0, 3, px);
    }
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(rx ?? 1 / size, ry ?? 1 / size);
    t.anisotropy = 8;
    return t;
  }, [size, base, rx, ry]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

function surfaceColor(project: StudioProject, systemId: string | null): string {
  if (!systemId) return RAW;
  const appearance = finishSystems[systemId]?.appearance;
  if (appearance === "tiles" || appearance === "largeTiles") return "#efece6";
  return project.paintColor;
}

function Floor({ project, selected, onSelect }: { project: StudioProject; selected: boolean; onSelect: (s: SurfaceId) => void }) {
  const { length: L, width: W } = project.room;
  const systemId = project.floor.systemId;
  const size = tileSize(systemId);
  const tiles = useTileTexture(size, "#e9e5dd", size ? [L / size, W / size] : undefined);
  const pick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect("floor");
  };
  return (
    <group>
      {/* Slab under the walls */}
      <mesh position={[L / 2, -0.06, W / 2]} receiveShadow>
        <boxGeometry args={[L + 2 * T + 0.4, 0.12, W + 2 * T + 0.4]} />
        <meshStandardMaterial color="#dedad2" roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[L / 2, 0.002, W / 2]} receiveShadow onClick={pick}>
        <planeGeometry args={[L, W]} />
        <meshStandardMaterial
          color={tiles ? "#ffffff" : systemId ? "#e4ded3" : RAW}
          map={tiles ?? undefined}
          roughness={0.7}
        />
        {selected && <Edges color={BRAND} lineWidth={2} />}
      </mesh>
    </group>
  );
}

function Wall({
  project,
  wall,
  selected,
  onSelect,
}: {
  project: StudioProject;
  wall: WallId;
  selected: boolean;
  onSelect: (s: SurfaceId) => void;
}) {
  const mesh = useRef<Mesh>(null);
  const openingsGroup = useRef<Group>(null);
  const H = project.room.height;
  const frame = wallFrame(project, wall);
  const surface = project.walls[wall];
  const tiles = useTileTexture(tileSize(surface.systemId), "#efece6");

  const geometry = useMemo(() => {
    const ext = wall === "A" || wall === "C" ? T : 0;
    const shape = new Shape();
    shape.moveTo(-ext, 0);
    shape.lineTo(frame.length + ext, 0);
    shape.lineTo(frame.length + ext, H);
    shape.lineTo(-ext, H);
    shape.closePath();
    for (const o of surface.openings) {
      const hole = new Shape();
      hole.moveTo(o.offset, o.sill);
      hole.lineTo(o.offset + o.width, o.sill);
      hole.lineTo(o.offset + o.width, o.sill + o.height);
      hole.lineTo(o.offset, o.sill + o.height);
      hole.closePath();
      shape.holes.push(hole);
    }
    const g = new ExtrudeGeometry(shape, { depth: T, bevelEnabled: false });
    // Local Z points into the room; the wall occupies z ∈ [-T, 0] (outside the room).
    g.translate(0, 0, -T);
    const basis = new Matrix4().makeBasis(
      new Vector3(frame.along.x, 0, frame.along.y),
      new Vector3(0, 1, 0),
      new Vector3(frame.inward.x, 0, frame.inward.y),
    );
    basis.setPosition(frame.origin.x, 0, frame.origin.y);
    g.applyMatrix4(basis);
    return g;
  }, [frame.along.x, frame.along.y, frame.inward.x, frame.inward.y, frame.origin.x, frame.origin.y, frame.length, H, surface.openings, wall]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const materials = useMemo(() => {
    const face = new MeshStandardMaterial({
      color: tiles ? "#ffffff" : surfaceColor(project, surface.systemId),
      map: tiles ?? null,
      roughness: tiles ? 0.35 : 0.9,
      transparent: true,
    });
    const reveal = new MeshStandardMaterial({ color: "#d6d2c9", roughness: 0.95, transparent: true });
    return [face, reveal];
  }, [tiles, project, surface.systemId]);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  // Fade walls that stand between the camera and the room (cutaway).
  const outward = useMemo(() => new Vector3(-frame.inward.x, 0, -frame.inward.y), [frame.inward.x, frame.inward.y]);
  const toCamera = useRef(new Vector3());
  const faded = useRef(false);
  useFrame((state) => {
    const current = mesh.current;
    if (!current) return;
    const direction = toCamera.current.set(state.camera.position.x, 0, state.camera.position.z).normalize();
    const target = outward.dot(direction) > 0.35 ? 0.12 : 1;
    // Materials are reached through the mesh so the memoised array stays untouched.
    for (const m of current.material as MeshStandardMaterial[]) {
      m.opacity += (target - m.opacity) * 0.15;
      m.depthWrite = m.opacity > 0.95;
    }
    current.castShadow = target === 1;
    faded.current = target < 1;
    if (openingsGroup.current) openingsGroup.current.visible = target === 1;
  });

  const pick = (event: ThreeEvent<MouseEvent>) => {
    // Ignore clicks on faded walls so the wall behind can be picked.
    if (faded.current) return;
    event.stopPropagation();
    onSelect(wall);
  };

  return (
    <group>
      <mesh ref={mesh} geometry={geometry} material={materials} castShadow receiveShadow onClick={pick}>
        {selected && <Edges color={BRAND} threshold={30} lineWidth={2} />}
      </mesh>
      <group ref={openingsGroup}>
        {surface.openings.map((o) => (
          <OpeningMesh key={o.id} frame={frame} opening={o} />
        ))}
      </group>
    </group>
  );
}

function OpeningMesh({ frame, opening }: { frame: ReturnType<typeof wallFrame>; opening: StudioProject["walls"]["A"]["openings"][number] }) {
  const s = opening.offset + opening.width / 2;
  const cx = frame.origin.x + frame.along.x * s - frame.inward.x * (T / 2);
  const cz = frame.origin.y + frame.along.y * s - frame.inward.y * (T / 2);
  const angle = Math.atan2(-frame.along.y, frame.along.x);
  const cy = opening.sill + opening.height / 2;
  if (opening.kind === "window") {
    return (
      <mesh position={[cx, cy, cz]} rotation-y={angle}>
        <boxGeometry args={[opening.width - 0.04, opening.height - 0.04, 0.02]} />
        <meshPhysicalMaterial color="#cfdde4" transmission={0.6} roughness={0.08} transparent opacity={0.45} />
      </mesh>
    );
  }
  return (
    <mesh position={[cx, cy, cz]} rotation-y={angle} castShadow>
      <boxGeometry args={[opening.width - 0.02, opening.height - 0.01, 0.04]} />
      <meshStandardMaterial color="#b5afa4" roughness={0.6} />
    </mesh>
  );
}
