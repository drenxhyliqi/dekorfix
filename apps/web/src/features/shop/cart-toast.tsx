"use client";

import { ChevronRight, CircleCheck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useCart, useShopFormat } from "./cart-context";
import "./shop.css";

/** How long the toast stays; paused while hovered or focused. */
const SHOW_MS = 4000;
/** Keep in step with `.sh-toast--leaving` in shop.css. */
const LEAVE_MS = 200;

/**
 * "Added to cart" notification: a small one-line confirmation that opens the
 * cart when tapped, without opening the cart panel (only the header's cart
 * button does that). A new addition replaces it.
 */
export function CartToast() {
  const { toast, dismissToast, products, copy, links } = useCart();
  const format = useShopFormat();
  const [leaving, setLeaving] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fades out, then clears the toast (unless a newer one has replaced it meanwhile).
  const close = (id: number) => {
    setLeaving(id);
    setTimeout(() => {
      setLeaving((current) => (current === id ? null : current));
      dismissToast(id);
    }, LEAVE_MS);
  };
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  // Each new toast starts unpaused, even if the last one was closed under the pointer.
  const id = toast?.id;
  const [shownId, setShownId] = useState(id);
  if (id !== shownId) {
    setShownId(id);
    setPaused(false);
  }
  useEffect(() => {
    if (id === undefined || paused) return;
    timer.current = setTimeout(() => closeRef.current(id), SHOW_MS);
    return () => clearTimeout(timer.current);
  }, [id, paused]);

  const product = toast && products.find((entry) => entry.slug === toast.slug);

  // The live region stays mounted so each new toast is announced.
  return (
    <div role="status" aria-live="polite" className="sh-toast-region">
      {toast && product && (
        <div
          key={toast.id}
          className={leaving === toast.id ? "sh-toast sh-toast--leaving" : "sh-toast"}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {/* The whole notification opens the cart. */}
          <Link href={links.cart} onClick={() => close(toast.id)} className="sh-toast-link group/toast">
            <span className="relative size-9 shrink-0 overflow-hidden rounded-xs bg-surface-muted">
              <Image src={product.image} alt="" fill sizes="36px" className="object-contain p-0.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-small font-medium leading-tight text-text">
                <CircleCheck aria-hidden className="size-3.5 shrink-0 text-brand" strokeWidth={2} />
                {copy.added}
              </span>
              <span className="mt-0.5 block truncate text-caption leading-tight text-text-secondary">
                {toast.quantity} × {product.name} · {format.packLine(product.unit, toast.packKg)}
                {toast.more > 0 && ` ${copy.toastMore.replace("{n}", String(toast.more))}`}
              </span>
            </span>
            <span className="sr-only">{copy.cart.view}</span>
            <ChevronRight
              aria-hidden
              className="size-4 shrink-0 text-text-tertiary transition-transform duration-200 group-hover/toast:translate-x-0.5 group-hover/toast:text-text"
              strokeWidth={1.75}
            />
          </Link>
          <button
            type="button"
            onClick={() => close(toast.id)}
            aria-label={copy.dismiss}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-text-tertiary transition-colors duration-150 hover:bg-surface-muted hover:text-text"
          >
            <X aria-hidden className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}
