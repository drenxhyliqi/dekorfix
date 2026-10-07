/**
 * Architectural line drawing for the Project Studio teaser: a wall elevation
 * with openings and dimension lines, plus the wall's material layers.
 * Purely illustrative; values are not product data. Colours follow the tone.
 */
export function WallDiagram({ label, layers }: { label: string; layers: string[] }) {
  // Layer stack, outermost (finish) on top.
  const stack = [...layers].reverse();
  const thickness = [6, 14, 10, 18];

  return (
    <svg viewBox="0 0 680 440" role="img" aria-label={label} className="h-auto w-full text-small">
      {/* Grid */}
      <defs>
        <pattern id="wd-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" className="stroke-border" strokeWidth="1" />
        </pattern>
        <pattern id="wd-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" className="stroke-border-strong" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="680" height="440" fill="url(#wd-grid)" opacity="0.5" />

      {/* Wall elevation */}
      <rect x="70" y="60" width="380" height="280" fill="url(#wd-hatch)" className="stroke-text" strokeWidth="1.5" />
      {/* Window */}
      <rect x="120" y="120" width="110" height="100" className="fill-background stroke-text" strokeWidth="1.5" />
      <line x1="175" y1="120" x2="175" y2="220" className="stroke-text-tertiary" strokeWidth="1" />
      {/* Door */}
      <rect x="320" y="170" width="80" height="170" className="fill-background stroke-text" strokeWidth="1.5" />
      <circle cx="388" cy="262" r="2.5" className="fill-text" />

      {/* Width dimension */}
      <g className="stroke-text-tertiary" strokeWidth="1">
        <line x1="70" y1="372" x2="450" y2="372" />
        <line x1="70" y1="362" x2="70" y2="382" />
        <line x1="450" y1="362" x2="450" y2="382" />
        <line x1="40" y1="60" x2="40" y2="340" />
        <line x1="30" y1="60" x2="50" y2="60" />
        <line x1="30" y1="340" x2="50" y2="340" />
      </g>
      <g className="stroke-brand" strokeWidth="2">
        <line x1="66" y1="376" x2="74" y2="368" />
        <line x1="446" y1="376" x2="454" y2="368" />
        <line x1="36" y1="64" x2="44" y2="56" />
        <line x1="36" y1="344" x2="44" y2="336" />
      </g>
      <text x="260" y="398" textAnchor="middle" className="fill-text-secondary tabular-nums">
        4.20 m
      </text>
      <text x="20" y="200" textAnchor="middle" transform="rotate(-90 20 200)" className="fill-text-secondary tabular-nums">
        2.80 m
      </text>
      <text x="175" y="110" textAnchor="middle" className="fill-text-tertiary tabular-nums" fontSize="11">
        1.20 × 1.10
      </text>
      <text x="360" y="160" textAnchor="middle" className="fill-text-tertiary tabular-nums" fontSize="11">
        0.90 × 2.10
      </text>

      {/* Layer section */}
      <g transform="translate(500 60)">
        <text x="0" y="0" className="fill-text-tertiary" fontSize="11" letterSpacing="1">
          SECTION
        </text>
        {stack.map((name, index) => {
          const y = 24 + index * 58;
          const isFinish = index === 0;
          return (
            <g key={name}>
              <rect
                x="0"
                y={y}
                width={thickness[index] ?? 10}
                height="44"
                className={isFinish ? "fill-brand" : "fill-text-secondary"}
                opacity={isFinish ? 1 : 0.35 + index * 0.15}
              />
              <line x1="30" y1={y + 22} x2="44" y2={y + 22} className="stroke-text-tertiary" strokeWidth="1" />
              <text x="52" y={y + 26} className="fill-text">
                {name}
              </text>
              <text x="52" y={y + 42} className="fill-text-tertiary tabular-nums" fontSize="11">
                {String(stack.length - index).padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
