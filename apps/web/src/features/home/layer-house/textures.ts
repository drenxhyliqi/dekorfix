import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from "three";

/*
 * Surface textures for the 3D house, drawn once on canvases: no image files
 * to download. Each `size` is the area one tile covers, in metres, and sets
 * the texture's repeat for geometry whose UVs are in metres.
 */

/** Small deterministic generator (mulberry32), so the house looks the same on every visit. */
function random(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(width: number, height: number) {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  const context = element.getContext("2d");
  if (!context) throw new Error("2D canvas unavailable");
  return { element, context };
}

/** Speckles every pixel by up to ±amount (0–255), for grain. */
function grain(context: CanvasRenderingContext2D, width: number, height: number, amount: number, seed: number) {
  const next = random(seed);
  const image = context.getImageData(0, 0, width, height);
  for (let i = 0; i < image.data.length; i += 4) {
    const shift = (next() - 0.5) * 2 * amount;
    image.data[i] = (image.data[i] ?? 0) + shift;
    image.data[i + 1] = (image.data[i + 1] ?? 0) + shift;
    image.data[i + 2] = (image.data[i + 2] ?? 0) + shift;
  }
  context.putImageData(image, 0, 0);
}

/** Soft blotches, for trowel marks and uneven surfaces. */
function clouds(context: CanvasRenderingContext2D, width: number, height: number, count: number, tone: string, seed: number) {
  const next = random(seed);
  for (let i = 0; i < count; i++) {
    const x = next() * width;
    const y = next() * height;
    const r = (0.08 + next() * 0.22) * width;
    const gradient = context.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, tone);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = gradient;
    context.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

function finish(element: HTMLCanvasElement, size: [number, number], color = true): Texture {
  const texture = new CanvasTexture(element);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1 / size[0], 1 / size[1]);
  texture.anisotropy = 8;
  if (color) texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Aerated-concrete blocks (60 × 25 cm) in a running bond. Tile: 1.2 × 1 m. */
export function blocksTexture(): Texture {
  const { element, context } = canvas(512, 427);
  const next = random(3);
  context.fillStyle = "#b9b5ad";
  context.fillRect(0, 0, 512, 427);
  const bw = 256;
  const bh = 427 / 4;
  for (let row = 0; row < 4; row++) {
    const offset = row % 2 ? bw / 2 : 0;
    for (let x = -bw; x < 512 + bw; x += bw) {
      const tone = 212 + Math.round((next() - 0.5) * 14);
      context.fillStyle = `rgb(${tone},${tone - 2},${tone - 7})`;
      context.fillRect(x + offset + 2, row * bh + 2, bw - 4, bh - 4);
    }
  }
  grain(context, 512, 427, 10, 5);
  // Pores.
  for (let i = 0; i < 900; i++) {
    context.fillStyle = `rgba(120,115,105,${0.15 + next() * 0.3})`;
    context.fillRect(next() * 512, next() * 427, 1 + next() * 2, 1 + next() * 2);
  }
  return finish(element, [1.2, 1]);
}

/** White EPS insulation boards (100 × 50 cm), staggered. Tile: 2 × 1 m. */
export function boardsTexture(): Texture {
  const { element, context } = canvas(512, 256);
  const next = random(11);
  context.fillStyle = "#cfd3d0";
  context.fillRect(0, 0, 512, 256);
  for (let row = 0; row < 2; row++) {
    const offset = row % 2 ? 128 : 0;
    for (let x = -256; x < 768; x += 256) {
      const tone = 240 + Math.round(next() * 10);
      const gradient = context.createLinearGradient(0, row * 128, 0, row * 128 + 128);
      gradient.addColorStop(0, `rgb(${tone},${tone + 1},${tone - 2})`);
      gradient.addColorStop(1, `rgb(${tone - 8},${tone - 7},${tone - 10})`);
      context.fillStyle = gradient;
      context.fillRect(x + offset + 1.5, row * 128 + 1.5, 253, 125);
    }
  }
  grain(context, 512, 256, 5, 13);
  return finish(element, [2, 1]);
}

/** Red fiberglass mesh pressed into a grey base coat, with the strips' overlaps. Tile: 1 × 1 m. */
export function meshTexture(): Texture {
  const { element, context } = canvas(512, 512);
  context.fillStyle = "#d3d0c9";
  context.fillRect(0, 0, 512, 512);
  clouds(context, 512, 512, 18, "rgba(255,255,255,0.18)", 17);
  grain(context, 512, 512, 8, 19);
  // Overlap where two strips meet: a band with the mesh doubled.
  context.fillStyle = "rgba(224,57,47,0.12)";
  context.fillRect(0, 0, 52, 512);
  // Drawn coarser than the real 4 mm weave, so it still reads as a grid from afar.
  context.strokeStyle = "rgba(218,44,36,0.95)";
  context.lineWidth = 4;
  const step = 512 / 12;
  for (let i = 0; i <= 12; i++) {
    context.beginPath();
    context.moveTo(i * step, 0);
    context.lineTo(i * step, 512);
    context.moveTo(0, i * step);
    context.lineTo(512, i * step);
    context.stroke();
  }
  return finish(element, [1, 1]);
}

/** Smooth levelling plaster with soft trowel clouding. Tile: 1.5 × 1.5 m. */
export function plasterTexture(): Texture {
  const { element, context } = canvas(512, 512);
  context.fillStyle = "#dcd9d2";
  context.fillRect(0, 0, 512, 512);
  clouds(context, 512, 512, 22, "rgba(160,155,145,0.06)", 23);
  clouds(context, 512, 512, 16, "rgba(255,255,255,0.12)", 29);
  grain(context, 512, 512, 4, 31);
  return finish(element, [1.5, 1.5]);
}

/** Grained decorative render in a sand tone, plus a matching bump map. Tile: 0.8 × 0.8 m. */
export function renderTextures(): { map: Texture; bump: Texture } {
  const { element, context } = canvas(512, 512);
  context.fillStyle = "#e6d4b4";
  context.fillRect(0, 0, 512, 512);
  clouds(context, 512, 512, 14, "rgba(190,165,120,0.12)", 37);
  grain(context, 512, 512, 14, 41);
  const next = random(43);
  for (let i = 0; i < 2600; i++) {
    const light = next() > 0.5;
    context.fillStyle = light ? "rgba(250,242,226,0.9)" : "rgba(170,145,105,0.55)";
    context.beginPath();
    context.arc(next() * 512, next() * 512, 0.8 + next() * 1.6, 0, Math.PI * 2);
    context.fill();
  }
  const bump = canvas(256, 256);
  bump.context.fillStyle = "#808080";
  bump.context.fillRect(0, 0, 256, 256);
  grain(bump.context, 256, 256, 70, 47);
  return { map: finish(element, [0.8, 0.8]), bump: finish(bump.element, [0.8, 0.8], false) };
}

/** Terracotta roof tiles in rows. Tile: 1.2 × 1.12 m (4 × 4 tiles). */
export function roofTexture(): Texture {
  const { element, context } = canvas(512, 512);
  const next = random(53);
  const tw = 128;
  const th = 128;
  for (let row = 0; row < 4; row++) {
    const offset = row % 2 ? tw / 2 : 0;
    for (let x = -tw; x < 512 + tw; x += tw) {
      const r = 176 + Math.round((next() - 0.5) * 26);
      const gradient = context.createLinearGradient(x + offset, 0, x + offset + tw, 0);
      gradient.addColorStop(0, `rgb(${r - 30},${Math.round(r * 0.42)},${Math.round(r * 0.3)})`);
      gradient.addColorStop(0.45, `rgb(${r},${Math.round(r * 0.47)},${Math.round(r * 0.33)})`);
      gradient.addColorStop(1, `rgb(${r - 40},${Math.round(r * 0.38)},${Math.round(r * 0.27)})`);
      context.fillStyle = gradient;
      context.fillRect(x + offset + 1, row * th, tw - 2, th);
      // The shadow of the row above.
      context.fillStyle = "rgba(40,15,8,0.35)";
      context.fillRect(x + offset, row * th, tw, 10);
    }
  }
  grain(context, 512, 512, 8, 59);
  return finish(element, [1.2, 1.12]);
}

/** Ground: soil and lawn share one grain, coloured by the material. Tile: 3 × 3 m. */
export function groundTexture(): Texture {
  const { element, context } = canvas(256, 256);
  context.fillStyle = "#c8c8c8";
  context.fillRect(0, 0, 256, 256);
  clouds(context, 256, 256, 16, "rgba(255,255,255,0.25)", 61);
  clouds(context, 256, 256, 16, "rgba(0,0,0,0.12)", 67);
  grain(context, 256, 256, 26, 71);
  return finish(element, [3, 3]);
}

/** Concrete pavers for the path and terrace. Tile: 1.2 × 1.2 m. */
export function paversTexture(): Texture {
  const { element, context } = canvas(256, 256);
  const next = random(73);
  context.fillStyle = "#9d9a94";
  context.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 4; row++) {
    const offset = row % 2 ? 64 : 0;
    for (let x = -128; x < 256; x += 128) {
      const tone = 196 + Math.round((next() - 0.5) * 20);
      context.fillStyle = `rgb(${tone},${tone - 3},${tone - 8})`;
      context.fillRect(x + offset + 2, row * 64 + 2, 124, 60);
    }
  }
  grain(context, 256, 256, 10, 79);
  return finish(element, [1.2, 1.2]);
}

/** Vertical wooden boards for the front door. Tile: 1 × 1 m. */
export function woodTexture(): Texture {
  const { element, context } = canvas(256, 256);
  const next = random(83);
  for (let x = 0; x < 256; x += 32) {
    const tone = 110 + Math.round(next() * 20);
    context.fillStyle = `rgb(${tone},${Math.round(tone * 0.66)},${Math.round(tone * 0.45)})`;
    context.fillRect(x, 0, 32, 256);
    context.fillStyle = "rgba(30,18,10,0.5)";
    context.fillRect(x, 0, 2, 256);
    for (let i = 0; i < 12; i++) {
      context.fillStyle = `rgba(40,24,12,${0.08 + next() * 0.12})`;
      context.fillRect(x + 4 + next() * 24, 0, 1, 256);
    }
  }
  return finish(element, [1, 1]);
}

/** A white Dekorfix bag face with the red band. Not repeated. */
export function bagTexture(): Texture {
  const { element, context } = canvas(256, 128);
  context.fillStyle = "#f4f4f2";
  context.fillRect(0, 0, 256, 128);
  context.fillStyle = "#e41e25";
  context.fillRect(0, 74, 256, 26);
  context.fillStyle = "#0d0d0c";
  context.font = "bold 30px sans-serif";
  context.fillText("Dekor", 40, 56);
  context.fillStyle = "#e41e25";
  context.fillText("Fix", 128, 56);
  const texture = new CanvasTexture(element);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
