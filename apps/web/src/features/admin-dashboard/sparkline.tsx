import { smoothPath } from "./format";

/** A small trend line with a soft fill, scaled to its own maximum. Decorative. */
/** `id` names the gradient; it must be unique on the page. */
export function Sparkline({ id, values, color }: { id: string; values: number[]; color: string }) {
  const W = 120;
  const H = 36;
  const max = Math.max(1, ...values);
  const points = values.map((value, index): [number, number] => [
    (index / Math.max(1, values.length - 1)) * W,
    H - 3 - (value / max) * (H - 6),
  ]);
  const line = smoothPath(points);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="db-spark" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  );
}
