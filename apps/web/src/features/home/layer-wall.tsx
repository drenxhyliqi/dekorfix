/*
 * The wall drawn for the "layer by layer" section: a front view of an
 * aerated-concrete block wall with the four Dekorfix layers applied over it,
 * each cut back in steps so every layer stays visible, and a finished wall
 * (full finish, a window, daylight) shown last.
 *
 * Each layer is painted on with the scroll: its mask holds PAINT_STROKES
 * horizontal strokes whose widths LayerWatcher sets from the scroll position.
 * Textures are noise images (rasterised once, so painting stays smooth); edges,
 * pores and grains come from a seeded generator so the drawing is the same on
 * every render.
 */

const W = 640;
const H = 520;
/** Where each layer's cut edge starts, left to right: primer, adhesive, plaster, finish. */
const STARTS = [92, 196, 300, 404] as const;

/** Layer colours, taken from the products: Beton Kontakt's red primer, grey cement adhesive, light plaster, a sand-tone finish. */
export const LAYER_COLORS = ["#c9535a", "#a29f98", "#d8d5ce", "#e3d0af"] as const;

/** Horizontal strokes each layer is painted with (see LayerWatcher). */
export const PAINT_STROKES = 6;
/** Mask strokes overhang the wall so their rounded ends never show at the edges. */
export const PAINT_OVERHANG = 24;
export const WALL_WIDTH = W;

const noise = (width: number, height: number, frequency: string, octaves: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='${octaves}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  )}`;
/** Fine grain, tiled; soft trowel clouding, one piece the size of the wall. */
const NOISE_FINE = noise(160, 160, "0.9", 2);
const NOISE_CLOUD = noise(W, H, "0.012 0.02", 3);

/** Small deterministic generator (mulberry32). */
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

const round = (value: number) => Math.round(value * 10) / 10;

/** A hand-applied edge: a slightly irregular line down the wall at `x`. */
function edgePoints(x: number, seed: number): Array<[number, number]> {
  const next = random(seed);
  const points: Array<[number, number]> = [];
  for (let y = 0; y <= H; y += 13) {
    points.push([round(x + (next() - 0.5) * 7 + Math.sin(y / 41 + seed) * 2.5), y]);
  }
  return points;
}

/** Specks scattered over a region: pores, quartz grains, render aggregate. */
function specks(count: number, x0: number, seed: number, rMin: number, rMax: number) {
  const next = random(seed);
  return Array.from({ length: count }, () => ({
    cx: round(x0 + next() * (W - x0)),
    cy: round(next() * H),
    r: round(rMin + next() * (rMax - rMin)),
    light: next() > 0.5,
  }));
}

const BLOCK_W = 178;
const BLOCK_H = 74;
const BLOCK_TONES = ["#d9d7d1", "#d5d3cd", "#dcdad4", "#d3d0c9"];

/** Aerated-concrete blocks in a running bond. */
function blocks() {
  const next = random(11);
  const out: Array<{ x: number; y: number; fill: string }> = [];
  for (let row = 0; row * BLOCK_H < H; row++) {
    const offset = row % 2 === 0 ? 0 : -BLOCK_W / 2;
    for (let x = offset; x < W; x += BLOCK_W) {
      out.push({ x, y: row * BLOCK_H, fill: BLOCK_TONES[Math.floor(next() * BLOCK_TONES.length)] ?? "#d8d6d0" });
    }
  }
  return out;
}

/** Decorative: the steps beside it say what each layer is. */
/** The coat's thickness: a soft shadow just outside its edge, drawn as fading strokes. */
function EdgeShadow({ points }: { points: Array<[number, number]> }) {
  const d = `M ${points.map(([x, y]) => `${round(x - 2)} ${y}`).join(" L ")}`;
  return (
    <g fill="none" stroke="#000" strokeLinejoin="round">
      <path d={d} strokeWidth="9" opacity="0.05" />
      <path d={d} strokeWidth="5" opacity="0.08" />
      <path d={d} strokeWidth="2" opacity="0.12" />
    </g>
  );
}

export function LayerWall() {
  const edges = STARTS.map((x, i) => edgePoints(x, 20 + i * 7));
  const clipPath = (points: Array<[number, number]>) =>
    `M ${W} 0 ${points.map(([x, y]) => `L ${x} ${y}`).join(" ")} L ${W} ${H} Z`;
  const edgeLine = (points: Array<[number, number]>) =>
    `M ${points.map(([x, y]) => `${x} ${y}`).join(" L ")}`;
  const stripCentre = (i: number) => ((STARTS[i] ?? 0) + (STARTS[i + 1] ?? W)) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ls-wall" aria-hidden>
      <defs>
        <pattern id="ls-grain" width="160" height="160" patternUnits="userSpaceOnUse">
          <image href={NOISE_FINE} width="160" height="160" />
        </pattern>
        <filter id="ls-soft-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#3b2f1c" floodOpacity="0.3" />
        </filter>

        {/* Notched-trowel ridges combed into the adhesive. */}
        <pattern id="ls-comb" width="12" height="52" patternUnits="userSpaceOnUse">
          <path d="M 3 0 C 5 13, 1 26, 3 39 S 5 52, 3 52 L 8 52 C 10 39, 6 26, 8 13 S 10 0, 8 0 Z" fill="#000" opacity="0.18" />
          <path d="M 8 0 C 10 13, 6 26, 8 39 S 10 52, 8 52" stroke="#fff" strokeWidth="1" opacity="0.25" fill="none" />
        </pattern>

        <linearGradient id="ls-sky" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#e3edf2" />
          <stop offset="1" stopColor="#9ebbcb" />
        </linearGradient>
        <linearGradient id="ls-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="ls-sill-shadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2116" stopOpacity="0.32" />
          <stop offset="1" stopColor="#2a2116" stopOpacity="0" />
        </linearGradient>

        {edges.map((points, i) => (
          <clipPath key={i} id={`ls-edge-${i}`}>
            <path d={clipPath(points)} />
          </clipPath>
        ))}

        {/* Paint masks, one per layer and one for the finished wall. Strokes start
            at the layer's own edge with zero width; LayerWatcher sets the widths. */}
        {[...STARTS, 0].map((start, i) => (
          <mask
            key={i}
            id={`ls-paint-${i}`}
            maskUnits="userSpaceOnUse"
            x={-PAINT_OVERHANG}
            y={-PAINT_OVERHANG}
            width={W + PAINT_OVERHANG * 2}
            height={H + PAINT_OVERHANG * 2}
          >
            {Array.from({ length: PAINT_STROKES }, (_, k) => {
              const band = H / PAINT_STROKES;
              return (
                <rect
                  key={k}
                  data-paint={i}
                  x={start - PAINT_OVERHANG - 8}
                  y={round(k * band - 6)}
                  width="0"
                  height={round(band + 12)}
                  rx={round(band / 2)}
                  fill="#fff"
                />
              );
            })}
          </mask>
        ))}

        {/* The finish render, used for its strip and for the finished wall. */}
        <g id="ls-finish-surface">
          <rect width={W} height={H} fill={LAYER_COLORS[3]} />
          <image href={NOISE_CLOUD} width={W} height={H} opacity="0.12" style={{ mixBlendMode: "multiply" }} />
          {specks(260, 0, 41, 0.5, 1.4).map((s, k) => (
            <circle key={k} cx={s.cx} cy={s.cy} r={s.r} fill={s.light ? "#f4e9d6" : "#c7b18c"} />
          ))}
          <rect width={W} height={H} fill="url(#ls-grain)" opacity="0.3" style={{ mixBlendMode: "multiply" }} />
        </g>
      </defs>

      {/* Substrate: aerated-concrete blocks, joints, pores and surface texture. */}
      <g>
        <rect width={W} height={H} fill="#bfbbb3" />
        {blocks().map((b, k) => (
          <rect key={k} x={b.x + 1} y={b.y + 1} width={BLOCK_W - 2} height={BLOCK_H - 2} fill={b.fill} />
        ))}
        {specks(220, 0, 3, 0.6, 1.8).map((s, k) => (
          <circle key={k} cx={s.cx} cy={s.cy} r={s.r} fill="#a8a49b" opacity={s.light ? 0.35 : 0.6} />
        ))}
        <rect width={W} height={H} fill="url(#ls-grain)" opacity="0.28" style={{ mixBlendMode: "multiply" }} />
      </g>

      {/* 01 Primer: translucent, joints still faintly visible, with quartz grains. */}
      <g data-layer={0} className="ls-coat" mask="url(#ls-paint-0)">
        <EdgeShadow points={edges[0] ?? []} />
        <g clipPath="url(#ls-edge-0)">
          <rect width={W} height={H} fill={LAYER_COLORS[0]} opacity="0.62" />
          {specks(160, STARTS[0] - 6, 17, 0.6, 1.5).map((s, k) => (
            <circle key={k} cx={s.cx} cy={s.cy} r={s.r} fill={s.light ? "#f6e4e1" : "#9e3a40"} opacity="0.8" />
          ))}
          <rect width={W} height={H} fill="url(#ls-grain)" opacity="0.18" style={{ mixBlendMode: "multiply" }} />
        </g>
      </g>

      {/* 02 Adhesive: cement grey, combed with a notched trowel. */}
      <g data-layer={1} className="ls-coat" mask="url(#ls-paint-1)">
        <EdgeShadow points={edges[1] ?? []} />
        <g clipPath="url(#ls-edge-1)">
          <rect width={W} height={H} fill={LAYER_COLORS[1]} />
          <rect width={W} height={H} fill="url(#ls-comb)" />
          <rect width={W} height={H} fill="url(#ls-grain)" opacity="0.32" style={{ mixBlendMode: "multiply" }} />
        </g>
        <path d={edgeLine(edges[1] ?? [])} stroke="#6f6c66" strokeWidth="1.2" fill="none" opacity="0.6" />
      </g>

      {/* 03 Plaster and skim coat: smooth, with soft trowel clouding. */}
      <g data-layer={2} className="ls-coat" mask="url(#ls-paint-2)">
        <EdgeShadow points={edges[2] ?? []} />
        <g clipPath="url(#ls-edge-2)">
          <rect width={W} height={H} fill={LAYER_COLORS[2]} />
          <image href={NOISE_CLOUD} width={W} height={H} opacity="0.22" style={{ mixBlendMode: "multiply" }} />
          <rect width={W} height={H} fill="url(#ls-grain)" opacity="0.14" style={{ mixBlendMode: "multiply" }} />
        </g>
        <path d={edgeLine(edges[2] ?? [])} stroke="#a9a59d" strokeWidth="1" fill="none" opacity="0.7" />
      </g>

      {/* 04 Finish: grained render in a sand tone. */}
      <g data-layer={3} className="ls-coat" mask="url(#ls-paint-3)">
        <EdgeShadow points={edges[3] ?? []} />
        <g clipPath="url(#ls-edge-3)">
          <use href="#ls-finish-surface" />
        </g>
        <path d={edgeLine(edges[3] ?? [])} stroke="#b59f79" strokeWidth="1" fill="none" opacity="0.7" />
      </g>

      {/* Step tags over each strip. */}
      {STARTS.map((_, i) => (
        <g key={i} data-layer={i} className="ls-tag" transform={`translate(${stripCentre(i)} 30)`}>
          <rect x="-19" y="-12" width="38" height="24" rx="12" />
          <text y="4.5" textAnchor="middle">
            {String(i + 1).padStart(2, "0")}
          </text>
        </g>
      ))}

      {/* The finished wall: full finish, a window in its reveal, a sill and its shadow. */}
      <g data-layer={4} className="ls-finished">
        {/* The finish rolled over the whole wall, then the window. */}
        <g mask="url(#ls-paint-4)">
          <use href="#ls-finish-surface" />
        </g>
        <g className="ls-window">
        <g filter="url(#ls-soft-shadow)">
          <rect x="190" y="96" width="260" height="262" fill="#bba985" />
          {/* Reveal: shaded top and left inner faces. */}
          <path d="M 190 96 L 450 96 L 438 108 L 202 108 Z" fill="#9d8b68" />
          <path d="M 190 96 L 202 108 L 202 358 L 190 358 Z" fill="#a8956f" />
          <rect x="202" y="108" width="236" height="250" fill="#f4f3ef" stroke="#d8d5ce" strokeWidth="1" />
          <rect x="214" y="120" width="100" height="226" fill="url(#ls-sky)" />
          <rect x="326" y="120" width="100" height="226" fill="url(#ls-sky)" />
          {/* Reflections. */}
          <path d="M 214 120 L 262 120 L 214 200 Z" fill="#fff" opacity="0.35" />
          <path d="M 326 170 L 380 120 L 404 120 L 326 232 Z" fill="#fff" opacity="0.22" />
          {/* Shadow cast by the head of the reveal onto the glass. */}
          <rect x="214" y="120" width="212" height="10" fill="#000" opacity="0.08" />
          {/* Handles. */}
          <rect x="304" y="226" width="4" height="22" rx="2" fill="#bdbab3" />
          <rect x="332" y="226" width="4" height="22" rx="2" fill="#bdbab3" />
        </g>
        <rect x="180" y="356" width="280" height="12" rx="1.5" fill="#efece6" stroke="#d6d2c9" strokeWidth="1" />
        <rect x="182" y="368" width="276" height="16" fill="url(#ls-sill-shadow)" />
        </g>
      </g>

      {/* Daylight across the whole wall. */}
      <rect width={W} height={H} fill="url(#ls-light)" pointerEvents="none" />
    </svg>
  );
}
