"use client";

import { CircleCheck, X } from "lucide-react";
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
 * "Added to cart" toast: confirms an addition without opening the cart panel
 * (only the header's cart button does that). A new addition replaces it.
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
          <span className="relative size-14 shrink-0 overflow-hidden rounded-xs border border-border bg-surface-muted">
            <Image src={product.image} alt="" fill sizes="56px" className="object-contain p-1" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-small font-medium text-text">
              <CircleCheck aria-hidden className="size-4 shrink-0 text-brand" strokeWidth={1.75} />
              {copy.added}
            </p>
            <p className="mt-0.5 truncate text-small text-text-secondary">
              {toast.quantity} × {product.name}
              {toast.more > 0 && <span className="text-text-tertiary"> {copy.toastMore.replace("{n}", String(toast.more))}</span>}
            </p>
            <div className="flex items-end justify-between gap-3">
              <p className="min-w-0 text-caption tabular-nums text-text-tertiary">
                {format.packLine(product.unit, toast.packKg)}
              </p>
              <Link
                href={links.cart}
                onClick={() => close(toast.id)}
                className="shrink-0 text-small font-medium text-text underline underline-offset-4 hover:text-brand-text"
              >
                {copy.cart.view}
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={() => close(toast.id)}
            aria-label={copy.dismiss}
            className="-mr-1.5 inline-flex size-8 shrink-0 items-center justify-center self-start rounded-sm text-text-tertiary transition-colors duration-150 hover:bg-surface-muted hover:text-text"
          >
            <X aria-hidden className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}
