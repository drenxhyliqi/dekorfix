/*
 * Formatting and small geometry helpers for the admin dashboard (Albanian).
 * Pure, so they run anywhere.
 */

/*
 * Albanian names are written out here rather than taken from Intl: browsers
 * without Albanian locale data would otherwise render different text from the
 * server (and fail hydration).
 */

const TIME_ZONE = "Europe/Belgrade";
const MONTHS = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];
const MONTHS_SHORT = ["jan", "shk", "mar", "pri", "maj", "qer", "korr", "gush", "sht", "tet", "nën", "dhj"];
const WEEKDAYS = ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"];

/** Whole numbers with a space between thousands, e.g. "12 480". */
export const number = {
  format: (value: number) => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"),
};

/** Change against the previous period, as a whole percent; null when there is nothing to compare with. */
export function delta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

/** "para 3 orësh", "dje", … relative to `now`. */
export function ago(value: string, now: string): string {
  const minutes = Math.max(0, (new Date(now).getTime() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return "tani";
  if (minutes < 60) return `para ${Math.round(minutes)} min`;
  const hours = minutes / 60;
  if (hours < 24) return Math.round(hours) === 1 ? "para 1 ore" : `para ${Math.round(hours)} orësh`;
  const days = Math.round(hours / 24);
  return days === 1 ? "dje" : `para ${days} ditësh`;
}

/** Year, month, day, weekday and hour of an instant, in Kosovo. */
function local(value: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      hour12: false,
    })
      .formatToParts(new Date(value))
      .map((part) => [part.type, part.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  return { year, month, day, hour: Number(parts.hour) % 24, weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay() };
}

/** "Mirëmëngjes" / "Mirëdita" / "Mirëmbrëma" by the hour in Kosovo. */
export function greeting(now: string): string {
  const { hour } = local(now);
  return hour < 12 ? "Mirëmëngjes" : hour < 18 ? "Mirëdita" : "Mirëmbrëma";
}

/** "E premte, 9 tetor 2026". */
export function longDate(now: string): string {
  const { year, month, day, weekday } = local(now);
  const name = WEEKDAYS[weekday] ?? "";
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}, ${day} ${MONTHS[month - 1]} ${year}`;
}

function parseDay(day: string) {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
  return { year, month, date, weekday: new Date(Date.UTC(year, month - 1, date)).getUTCDay() };
}

/** "9 tet" for a YYYY-MM-DD day. */
export function shortDay(day: string): string {
  const { month, date } = parseDay(day);
  return `${date} ${MONTHS_SHORT[month - 1]}`;
}

/** "E enjte, 9 tetor" for a YYYY-MM-DD day. */
export function fullDay(day: string): string {
  const { month, date, weekday } = parseDay(day);
  const name = WEEKDAYS[weekday] ?? "";
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}, ${date} ${MONTHS[month - 1]}`;
}

/**
 * A smooth line through points that never overshoots them (monotone cubic,
 * Fritsch–Carlson), so a day with no activity never dips below zero.
 */
export function smoothPath(points: Array<[number, number]>): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M${points[0]?.[0]},${points[0]?.[1]}`;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) slopes.push(((ys[i + 1] ?? 0) - (ys[i] ?? 0)) / ((xs[i + 1] ?? 0) - (xs[i] ?? 0) || 1));
  const tangents = xs.map((_, i) => {
    if (i === 0) return slopes[0] ?? 0;
    if (i === n - 1) return slopes[n - 2] ?? 0;
    const a = slopes[i - 1] ?? 0;
    const b = slopes[i] ?? 0;
    return a * b <= 0 ? 0 : (a + b) / 2;
  });
  for (let i = 0; i < n - 1; i++) {
    const s = slopes[i] ?? 0;
    if (s === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = (tangents[i] ?? 0) / s;
    const b = (tangents[i + 1] ?? 0) / s;
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      tangents[i] = t * a * s;
      tangents[i + 1] = t * b * s;
    }
  }
  let d = `M${xs[0]?.toFixed(2)},${ys[0]?.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const x0 = xs[i] ?? 0;
    const x1 = xs[i + 1] ?? 0;
    const dx = (x1 - x0) / 3;
    d += ` C${(x0 + dx).toFixed(2)},${((ys[i] ?? 0) + (tangents[i] ?? 0) * dx).toFixed(2)} ${(x1 - dx).toFixed(2)},${(
      (ys[i + 1] ?? 0) - (tangents[i + 1] ?? 0) * dx
    ).toFixed(2)} ${x1.toFixed(2)},${(ys[i + 1] ?? 0).toFixed(2)}`;
  }
  return d;
}

/** A "nice" axis maximum (1, 2, 5 × 10ⁿ) at or above `value`. */
export function niceMax(value: number): number {
  if (value <= 4) return 4;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value) ?? 10;
  return step * power;
}
