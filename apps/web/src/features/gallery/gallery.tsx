"use client";

import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

import type { GalleryGroup } from "@/content/gallery";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

import "./gallery.css";

export interface GalleryItem {
  id: string;
  src: string;
  width: number;
  height: number;
  group: GalleryGroup;
  alt: string;
}

const GROUPS: Array<GalleryGroup | "all"> = ["all", "site", "interiors", "factory"];
/** Horizontal drag, in pixels, that counts as a swipe in the viewer. */
const SWIPE_PX = 50;

/** Photo grid with group filters; a photo opens full size in a viewer (arrows, swipe, Escape). */
export function Gallery({ items, copy }: { items: GalleryItem[]; copy: Dictionary["galleryPage"] }) {
  const [group, setGroup] = useState<GalleryGroup | "all">("all");
  const [open, setOpen] = useState<number | null>(null);
  const shown = group === "all" ? items : items.filter((item) => item.group === group);

  return (
    <div>
      <div role="group" aria-label={copy.filter} className="mb-8 flex flex-wrap items-center gap-2 md:mb-10">
        {GROUPS.map((key) => {
          const count = key === "all" ? items.length : items.filter((item) => item.group === key).length;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={group === key}
              onClick={() => setGroup(key)}
              className={cn("gl-chip", group === key && "gl-chip--current")}
            >
              {copy.groups[key]}
              <span className="gl-chip-count tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Keyed by the filter, so the photos rise in again when it changes. */}
      <ul key={group} className="gl-grid">
        {shown.map((item, index) => (
          <li key={item.id} className="gl-item" style={{ "--i": index } as CSSProperties}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              aria-label={copy.open.replace("{alt}", item.alt)}
              className="gl-tile group/tile"
            >
              <Image
                src={item.src}
                alt=""
                width={item.width}
                height={item.height}
                sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw"
                className="gl-photo"
              />
              <span aria-hidden className="gl-zoom">
                <Maximize2 className="size-4" strokeWidth={1.75} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Viewer items={shown} index={open} onIndex={setOpen} copy={copy} />
    </div>
  );
}

function Viewer({
  items,
  index,
  onIndex,
  copy,
}: {
  items: GalleryItem[];
  index: number | null;
  onIndex: (index: number | null) => void;
  copy: Dictionary["galleryPage"];
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const swipeFrom = useRef<number | null>(null);
  const item = index === null ? undefined : items[index];
  const total = items.length;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
  }, [item]);

  const step = (by: number) => index !== null && onIndex((index + by + total) % total);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") swipeFrom.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeFrom.current === null) return;
    const dx = event.clientX - swipeFrom.current;
    swipeFrom.current = null;
    if (Math.abs(dx) > SWIPE_PX) step(dx < 0 ? 1 : -1);
  };

  return (
    <dialog
      ref={ref}
      aria-label={copy.viewer}
      onClose={() => onIndex(null)}
      onKeyDown={onKeyDown}
      className="gl-viewer"
    >
      {item && index !== null && (
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
            <p className="text-small tabular-nums text-text-secondary" aria-live="polite">
              {copy.position.replace("{n}", String(index + 1)).replace("{total}", String(total))}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => onIndex(null)}
              aria-label={copy.close}
              className="gl-control"
            >
              <X aria-hidden className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          <div
            className="relative min-h-0 flex-1 touch-pan-y px-4 sm:px-20"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipeFrom.current = null)}
          >
            {/* The padding frames the photo: a filled image ignores its parent's padding. */}
            <div className="relative h-full w-full">
              <Image
                key={item.id}
                src={item.src}
                alt={item.alt}
                fill
                sizes="100vw"
                className="gl-full object-contain"
              />
            </div>
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={copy.previous}
                  className="gl-control gl-step left-4 sm:left-6"
                >
                  <ChevronLeft aria-hidden className="size-5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={copy.next}
                  className="gl-control gl-step right-4 sm:right-6"
                >
                  <ChevronRight aria-hidden className="size-5" strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-5 sm:px-6">
            <p className="text-small text-text">{item.alt}</p>
            {/* On phones the arrows sit here, under the photo, next to the swipe. */}
            {total > 1 && (
              <div className="flex gap-2 sm:hidden">
                <button type="button" onClick={() => step(-1)} aria-label={copy.previous} className="gl-control">
                  <ChevronLeft aria-hidden className="size-5" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => step(1)} aria-label={copy.next} className="gl-control">
                  <ChevronRight aria-hidden className="size-5" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
