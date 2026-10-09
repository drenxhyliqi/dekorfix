/*
 * The assistant's replies use a little markdown: paragraphs, "- " lists,
 * **bold** and [links](/sq/...). This turns a reply into blocks of inline
 * pieces, and only keeps links that point at real pages of this site (or a
 * phone number or email address): a small model sometimes invents paths.
 * Pure (no imports), so it runs under `node --test`.
 */

export type Inline = { kind: "text"; text: string } | { kind: "bold"; text: string } | { kind: "link"; text: string; href: string };
export type Block = { kind: "paragraph"; content: Inline[] } | { kind: "list"; items: Inline[][] };

/** Paths the site actually has, in either language. */
const PAGE =
  /^\/(sq|en)(\/(products(\/[a-z0-9-]+)?|cart|checkout|product-finder|export|projects|project-studio|calculator|about|contact|search|privacy|terms|cookies))?\/?(\?[a-z0-9=&,-]*)?$/;

/** A link the chat may open: a real page of this site, tel: or mailto:. Absolute links to this site become paths. */
export function safeHref(raw: string, ownHosts: string[] = []): string | null {
  const url = raw.trim().replace(/[.,;:!?)]+$/, "");
  if (/^tel:\+?[\d\s-]{6,}$/.test(url) || /^mailto:[^\s@]+@[^\s@]+$/.test(url)) return url.replace(/\s/g, "");
  let path = url;
  const absolute = /^https?:\/\/([^/]+)(\/.*)?$/i.exec(url);
  if (absolute) {
    const host = absolute[1]?.toLowerCase().replace(/^www\./, "") ?? "";
    if (!ownHosts.includes(host)) return null;
    path = absolute[2] ?? "/";
  }
  return PAGE.test(path) ? path : null;
}

/** Bold, links, and bare site paths (e.g. "/sq/cart") inside one line. */
export function parseInline(line: string, ownHosts: string[] = []): Inline[] {
  const pieces: Inline[] = [];
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]*)\)|(\/(?:sq|en)(?:\/[a-z0-9/?=&,-]*)?)/g;
  let last = 0;
  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) pieces.push({ kind: "text", text: line.slice(last, index) });
    const [whole, bold, label, target, bare] = match;
    if (bold) pieces.push({ kind: "bold", text: bold });
    else if (label !== undefined) {
      const href = safeHref(target ?? "", ownHosts);
      pieces.push(href ? { kind: "link", text: label, href } : { kind: "text", text: label });
    } else if (bare) {
      const href = safeHref(bare, ownHosts);
      pieces.push(href ? { kind: "link", text: bare, href } : { kind: "text", text: whole });
    }
    last = index + whole.length;
  }
  if (last < line.length) pieces.push({ kind: "text", text: line.slice(last) });
  return pieces;
}

export function parseRich(text: string, ownHosts: string[] = []): Block[] {
  const blocks: Block[] = [];
  for (const chunk of text.split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
    let list: Inline[][] | null = null;
    let paragraph: string[] = [];
    const flush = () => {
      if (paragraph.length) blocks.push({ kind: "paragraph", content: parseInline(paragraph.join(" "), ownHosts) });
      paragraph = [];
    };
    for (const line of lines) {
      const item = /^(?:[-*•]|\d+[.)])\s+(.*)$/.exec(line);
      if (item) {
        flush();
        if (!list) {
          list = [];
          blocks.push({ kind: "list", items: list });
        }
        list.push(parseInline(item[1] ?? "", ownHosts));
      } else {
        list = null;
        paragraph.push(line);
      }
    }
    flush();
  }
  return blocks;
}
