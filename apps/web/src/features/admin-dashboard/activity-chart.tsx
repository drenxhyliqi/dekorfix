"use client";

import type { DayCount } from "@dekorfix/shared";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

import { fullDay, niceMax, number, shortDay } from "./format";

interface Series {
  key: string;
  label: string;
  color: string;
  total: number;
  values: DayCount[];
}

/** One column of the chart: a day, or a week for long periods. */
interface Bucket {
  /** First day of the bucket (YYYY-MM-DD). */
  start: string;
  end: string;
  counts: number[];
}

const HEIGHT = 280;
const PAD = { top: 16, right: 8, bottom: 32, left: 36 };
/** Above this many days, days are grouped into weeks so the bars stay readable. */
const WEEKLY_AFTER = 45;

function buckets(series: Series[]): Bucket[] {
  const days = series[0]?.values ?? [];
  const size = days.length > WEEKLY_AFTER ? 7 : 1;
  const out: Bucket[] = [];
  // Weeks end on the last day, so the newest bucket is always a full week.
  for (let end = days.length; end > 0; end -= size) {
    const start = Math.max(0, end - size);
    out.unshift({
      start: days[start]?.date ?? "",
      end: days[end - 1]?.date ?? "",
      counts: series.map((entry) => entry.values.slice(start, end).reduce((sum, day) => sum + day.count, 0)),
    });
  }
  return out;
}

/**
 * Orders and messages per day (per week for 90 days) as paired rounded bars,
 * with a highlighted column and tooltip on hover, and a legend that turns a
 * series off.
 */
export function ActivityChart({ series, emptyLabel }: { series: Series[]; emptyLabel: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => entry && setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const columns = buckets(series);
  const weekly = (series[0]?.values.length ?? 0) > WEEKLY_AFTER;
  const visible = series.map((entry) => !hidden.has(entry.key));
  const shownCount = visible.filter(Boolean).length;
  const max = niceMax(Math.max(0, ...columns.flatMap((column) => column.counts.filter((_, index) => visible[index]))));
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const slot = plotW / Math.max(1, columns.length);
  const gap = Math.max(1.5, Math.min(4, slot * 0.08));
  const barW = Math.max(2, Math.min(18, (slot * 0.72 - gap * (shownCount - 1)) / Math.max(1, shownCount)));
  const groupW = barW * shownCount + gap * (shownCount - 1);
  const y = (value: number) => PAD.top + plotH - (value / max) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((share) => Math.round(max * share));
  const labelEvery = Math.max(1, Math.ceil(columns.length / Math.max(2, Math.floor(plotW / 72))));
  const empty = series.every((entry) => entry.total === 0);

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const position = ((event.clientX - box.left) / box.width) * width - PAD.left;
    const index = Math.floor(position / slot);
    setHover(index >= 0 && index < columns.length ? index : null);
  };

  const active = hover === null ? null : columns[hover];
  const label = (column: Bucket) => (weekly ? `${shortDay(column.start)} – ${shortDay(column.end)}` : fullDay(column.start));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {series.map((entry) => {
          const off = hidden.has(entry.key);
          return (
            <button
              key={entry.key}
              type="button"
              aria-pressed={!off}
              onClick={() =>
                setHidden((current) => {
                  const next = new Set(current);
                  if (off) next.delete(entry.key);
                  else if (series.length - current.size > 1) next.add(entry.key);
                  return next;
                })
              }
              className={cn("db-legend", off && "db-legend--off")}
            >
              <span aria-hidden className="db-legend-dot" style={{ background: entry.color }} />
              {entry.label}
              <span className="font-semibold tabular-nums text-text">{number.format(entry.total)}</span>
            </button>
          );
        })}
        <span className="ml-auto text-caption text-text-tertiary">{weekly ? "Për javë" : "Për ditë"}</span>
      </div>

      <div ref={frameRef} className="relative mt-4">
        <svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={series.map((entry) => `${entry.label}: ${entry.total}`).join(", ")}
          className="block w-full touch-pan-y"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} className={tick === 0 ? "db-axis" : "db-grid"} />
              <text x={PAD.left - 10} y={y(tick) + 4} textAnchor="end" className="db-tick">
                {number.format(tick)}
              </text>
            </g>
          ))}

          {hover !== null && (
            <rect x={PAD.left + hover * slot} y={PAD.top} width={slot} height={plotH} rx="6" className="db-column-hover" />
          )}

          {columns.map((column, index) => {
            const left = PAD.left + index * slot + (slot - groupW) / 2;
            let offset = 0;
            return (
              <g key={column.start} className="db-bars" style={{ animationDelay: `${index * (300 / columns.length)}ms` }}>
                {series.map((entry, seriesIndex) => {
                  if (!visible[seriesIndex]) return null;
                  const value = column.counts[seriesIndex] ?? 0;
                  const top = y(value);
                  const x = left + offset;
                  offset += barW + gap;
                  const h = y(0) - top;
                  return value > 0 ? (
                    <path
                      key={entry.key}
                      // Rounded top corners, square at the base.
                      d={`M${x},${y(0)} V${top + Math.min(barW / 2, h)} a${Math.min(barW / 2, h)},${Math.min(barW / 2, h)} 0 0 1 ${barW},0 V${y(0)} Z`}
                      fill={entry.color}
                      opacity={hover === null || hover === index ? 1 : 0.35}
                      className="db-bar-shape"
                    />
                  ) : null;
                })}
              </g>
            );
          })}

          {columns.map((column, index) =>
            index % labelEvery === 0 ? (
              <text key={column.start} x={PAD.left + index * slot + slot / 2} y={HEIGHT - 8} textAnchor="middle" className="db-tick">
                {shortDay(column.start)}
              </text>
            ) : null,
          )}
        </svg>

        {empty && <p className="db-empty-overlay">{emptyLabel}</p>}

        {hover !== null && active && (
          <div
            className="db-tooltip"
            style={{
              left: Math.min(Math.max(PAD.left + hover * slot + slot / 2, 100), width - 100),
              top: PAD.top,
            }}
          >
            <p className="text-caption font-medium text-text-tertiary">{label(active)}</p>
            {series.map((entry, index) =>
              visible[index] ? (
                <p key={entry.key} className="mt-1 flex items-center justify-between gap-6 text-small">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <span aria-hidden className="db-legend-dot" style={{ background: entry.color }} />
                    {entry.label}
                  </span>
                  <span className="font-semibold tabular-nums text-text">{number.format(active.counts[index] ?? 0)}</span>
                </p>
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  );
}
