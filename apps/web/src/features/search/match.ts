/*
 * Site search matching. Pure, so it runs under `node --test`. Case and
 * accents are ignored ("cilesi" finds "cilësi"); every word of the query must
 * appear somewhere in the entry, and title matches rank above text matches.
 */

export interface SearchEntry {
  title: string;
  text: string;
  /** Extra words that should find the entry (e.g. its category). */
  keywords?: string;
}

/** Lower case without accents: "Ç" → "c", "ë" → "e". */
export function fold(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function terms(query: string): string[] {
  return fold(query).split(/\s+/).filter(Boolean);
}

/** 0 when the entry does not match; higher is a better match. */
export function score(entry: SearchEntry, query: string): number {
  const words = terms(query);
  if (!words.length) return 0;
  const title = fold(entry.title);
  const rest = fold(`${entry.text} ${entry.keywords ?? ""}`);
  let total = 0;
  for (const word of words) {
    if (title.startsWith(word)) total += 6;
    else if (new RegExp(`\\b${escape(word)}`).test(title)) total += 4;
    else if (title.includes(word)) total += 3;
    else if (rest.includes(word)) total += 1;
    else return 0;
  }
  return total;
}

/**
 * Where the query's words appear in `value`, as [start, end) ranges on the
 * original text (accents included), merged and in order, for highlighting.
 */
export function highlights(value: string, query: string): Array<[number, number]> {
  // Fold character by character, remembering which original character each folded one came from.
  const origin: number[] = [];
  let folded = "";
  Array.from(value).forEach((char, index, chars) => {
    const offset = chars.slice(0, index).join("").length;
    for (const piece of fold(char)) {
      folded += piece;
      origin.push(offset);
    }
  });
  const ranges: Array<[number, number]> = [];
  for (const word of terms(query)) {
    let from = folded.indexOf(word);
    while (from !== -1) {
      const start = origin[from] ?? 0;
      const lastOrigin = origin[from + word.length - 1] ?? start;
      ranges.push([start, lastOrigin + 1]);
      from = folded.indexOf(word, from + word.length);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
}

function escape(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
