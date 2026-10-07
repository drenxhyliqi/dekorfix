import { BoxGeometry, Vector3 } from "three";

/** Proportions of a 25 kg valve sack, in scene units (width : height : depth). */
export const SACK = { width: 1.2, height: 2.2, depth: 0.4 } as const;

/**
 * A filled paper/PP sack: a subdivided box rounded into a superellipsoid
 * (soft edges), with front and back faces pillowing outwards and faint creases.
 * Keeps BoxGeometry's per-face UVs and material groups:
 * [+x side, -x side, top, bottom, front, back].
 */
export function createSackGeometry(detail: "high" | "low" = "high"): BoxGeometry {
  const { width, height, depth } = SACK;
  const q = detail === "high" ? 1 : 0.5;
  const geometry = new BoxGeometry(
    width,
    height,
    depth,
    Math.round(40 * q),
    Math.round(72 * q),
    Math.round(14 * q),
  );

  const a = width / 2;
  const b = height / 2;
  const c = depth / 2;
  const exponent = 9; // higher = sharper edges
  const position = geometry.attributes.position;
  if (!position) return geometry;
  const v = new Vector3();

  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    // Superellipsoid: pull edges and corners in so every edge is softly rounded.
    const k =
      (Math.abs(v.x / a) ** exponent + Math.abs(v.y / b) ** exponent + Math.abs(v.z / c) ** exponent) **
      (-1 / exponent);
    v.multiplyScalar(k);

    const nx = v.x / a;
    const ny = v.y / b;
    const side = Math.sign(v.z) || 1;
    // Pillow: the filled sack is thickest in the middle of its broad faces.
    const pillow = (1 - nx * nx) ** 1.3 * (1 - ny ** 8);
    // Faint diagonal creases from handling, strongest near the folded ends.
    const crease = Math.sin(nx * 5.1 + ny * 2.3) * Math.sin(ny * 9.7) * (0.4 + 0.6 * ny * ny);
    v.z += side * (0.07 * pillow + 0.0035 * crease * (1 - nx * nx));
    // Slightly narrower towards the folded top and bottom.
    v.x *= 1 - 0.035 * ny ** 6;
    position.setXYZ(i, v.x, v.y, v.z);
  }

  geometry.computeVertexNormals();
  smoothSeams(geometry);
  return geometry;
}

/**
 * BoxGeometry duplicates vertices along its edges (one copy per face), which
 * would leave hard shading seams. Average normals of vertices that share a
 * position so the rounded edges shade continuously.
 */
function smoothSeams(geometry: BoxGeometry): void {
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  if (!position || !normal) return;

  const key = (i: number) =>
    `${position.getX(i).toFixed(4)}|${position.getY(i).toFixed(4)}|${position.getZ(i).toFixed(4)}`;
  const sums = new Map<string, Vector3>();
  for (let i = 0; i < position.count; i++) {
    const k = key(i);
    const n = new Vector3().fromBufferAttribute(normal, i);
    const sum = sums.get(k);
    if (sum) sum.add(n);
    else sums.set(k, n);
  }
  for (let i = 0; i < position.count; i++) {
    const sum = sums.get(key(i));
    if (!sum) continue;
    const n = sum.clone().normalize();
    normal.setXYZ(i, n.x, n.y, n.z);
  }
  normal.needsUpdate = true;
}
