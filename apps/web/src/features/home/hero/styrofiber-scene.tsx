"use client";

import { ContactShadows, Environment, Lightformer, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  MathUtils,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  RepeatWrapping,
  SRGBColorSpace,
  type Group,
  type Texture,
} from "three";

import { heroLayout } from "./hero-layout";
import { heroState } from "./hero-state";
import { createSackGeometry, SACK } from "./sack-geometry";

const FRONT = "/images/3d/styrofiber-front.webp";
const SIDE = "/images/3d/styrofiber-side.webp";

/** Ease in-out so the turn starts and settles gently. */
const ease = (t: number) => t * t * (3 - 2 * t);

export interface StyrofiberSceneProps {
  /** Lower geometry detail and pixel ratio (phones, small tablets). */
  compact: boolean;
  /** Pause rendering while the hero is off screen. */
  active: boolean;
  onReady: () => void;
}

export default function StyrofiberScene({ compact, active, onReady }: StyrofiberSceneProps) {
  return (
    <Canvas
      dpr={compact ? [1, 1.5] : [1, 2]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 24, position: [0, 0.1, 9], near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = NeutralToneMapping; // keeps the brand red true
        gl.toneMappingExposure = 1.22;
      }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Sack compact={compact} onReady={onReady} />
        <Studio />
      </Suspense>
    </Canvas>
  );
}

/** Soft studio: large key softbox, a long rim strip and a low fill, rendered once. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={3.2} color="#fffaf2" position={[-3.5, 3, 6]} scale={[8, 6, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[5, 1.5, -1]} scale={[1.2, 9, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.1} color="#f3efe8" position={[1, -2.5, 6]} scale={[10, 2.5, 1]} target={[0, 0, 0]} />
      <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[2, 5, 4]} scale={2} target={[0, 0, 0]} />
    </Environment>
  );
}

function Sack({ compact, onReady }: { compact: boolean; onReady: () => void }) {
  const anchor = useRef<Group>(null);
  const body = useRef<Group>(null);
  const announced = useRef(false);
  const { front, side } = useTexture({ front: FRONT, side: SIDE }, (textures) => {
    for (const t of Object.values(textures) as Texture[]) {
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 8;
    }
  });

  const geometry = useMemo(() => createSackGeometry(compact ? "low" : "high"), [compact]);
  const weave = useMemo(() => createWeaveTexture(), []);

  const materials = useMemo(() => {
    const surface = { roughness: 0.48, clearcoat: 0.3, clearcoatRoughness: 0.42, bumpMap: weave, bumpScale: 0.35 };
    const panel = (map: Texture) => new MeshPhysicalMaterial({ map, ...surface });
    const black = new MeshPhysicalMaterial({ color: "#0b0b0b", ...surface, roughness: 0.55 });
    // Box groups: +x side, -x side, top, bottom, front, back.
    return [panel(side), panel(side), black, black, panel(front), panel(front)];
  }, [front, side, weave]);

  useEffect(
    () => () => {
      geometry.dispose();
      weave.dispose();
      for (const m of materials) m.dispose();
    },
    [geometry, weave, materials],
  );

  useFrame((state, delta) => {
    const a = anchor.current;
    const g = body.current;
    if (!a || !g) return;
    const still = heroState.reducedMotion;
    const p = ease(MathUtils.clamp(heroState.progress, 0, 1));
    const t = still ? 0 : state.clock.elapsedTime;
    const { viewport } = state;
    const layout = heroLayout(window.innerWidth, window.innerHeight);

    // Stand the sack on the floor line; it grows slightly from its base in act 2.
    const scale = ((layout.height * viewport.height) / SACK.height) * (1 + 0.07 * p);
    const x = (layout.x - 0.5) * viewport.width;
    const floorY = (0.5 - layout.floor) * viewport.height;
    const lambda = still ? 1000 : 3.2;

    a.scale.setScalar(MathUtils.damp(a.scale.x, scale, lambda, delta));
    a.position.x = MathUtils.damp(a.position.x, x, lambda, delta);
    a.position.y = floorY + (SACK.height / 2) * a.scale.x;
    // A slow breath: the sack lifts a few millimetres off its shadow.
    g.position.y = 0.02 + Math.sin(t * 0.55) * 0.014;

    // 3/4 view turning towards the printed gusset as the visitor scrolls.
    const rotY = MathUtils.lerp(-0.56, -1.08, p) + heroState.pointer.x * (still ? 0 : 0.09);
    const rotX = 0.03 - heroState.pointer.y * (still ? 0 : 0.04);
    g.rotation.y = MathUtils.damp(g.rotation.y, rotY, lambda, delta);
    g.rotation.x = MathUtils.damp(g.rotation.x, rotX, lambda, delta);
    g.rotation.z = Math.sin(t * 0.35) * 0.006 - 0.01;

    if (!announced.current) {
      announced.current = true;
      requestAnimationFrame(onReady);
    }
  });

  return (
    <group ref={anchor}>
      <group ref={body}>
        <mesh geometry={geometry} material={materials} />
      </group>
      <ContactShadows
        position={[0, -SACK.height / 2 - 0.005, 0]}
        scale={[2.6, 1.4]}
        far={0.9}
        blur={2.4}
        opacity={0.42}
        resolution={compact ? 256 : 512}
        color="#2a2520"
      />
    </group>
  );
}

/** Fine woven-polypropylene texture used as a bump map (generated, no download). */
function createWeaveTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);
    const step = 4;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const over = ((x + y) / step) % 2 === 0;
        ctx.fillStyle = over ? "#9a9a9a" : "#6a6a6a";
        ctx.fillRect(x, y, over ? step : step - 1, over ? step - 1 : step);
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(10, 18);
  return texture;
}
