"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { useCart, useShopFormat, type CartEntry } from "./cart-context";
import { QuantityStepper } from "./quantity-stepper";

/** The cart's lines: packshot, product, pack size, quantity and remove. */
export function CartLines({
  compact = false,
  onNavigate,
}: {
  /** Drawer layout: smaller packshots, everything in one column. */
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const { entries } = useCart();
  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => (
        <CartLineItem
          key={entry.key}
          entry={entry}
          compact={compact}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}

function CartLineItem({
  entry,
  compact,
  onNavigate,
}: {
  entry: CartEntry;
  compact: boolean;
  onNavigate?: () => void;
}) {
  const { copy, setQuantity, remove } = useCart();
  const format = useShopFormat();
  const { product } = entry;
  const lineTotal = entry.price === null ? null : entry.price * entry.quantity;

  return (
    <li className={cn("flex gap-4 py-5", compact ? "sm:gap-4" : "sm:gap-6")}>
      <Link
        href={product.href}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden
        className={cn(
          "relative shrink-0 overflow-hidden rounded-sm border border-border bg-surface-muted",
          compact ? "size-20" : "size-24 sm:size-28",
        )}
      >
        <Image src={product.image} alt="" fill sizes="112px" className="object-contain p-2" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-caption uppercase tracking-[0.06em] text-text-tertiary">{product.categoryLabel}</p>
            <Link
              href={product.href}
              onClick={onNavigate}
              className="mt-0.5 block truncate text-[1.0625rem] font-medium text-text hover:underline"
            >
              {product.name}
            </Link>
            <p className="mt-0.5 text-small text-text-secondary">
              <span className="tabular-nums">{format.packLine(product.unit, entry.packKg)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => remove(entry.key)}
            aria-label={copy.cart.removeNamed.replace("{name}", product.name)}
            title={copy.cart.remove}
            className="-mr-2 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-sm text-text-tertiary transition-colors duration-150 hover:bg-surface-muted hover:text-text"
          >
            <Trash2 aria-hidden className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <QuantityStepper
            value={entry.quantity}
            min={0}
            onChange={(quantity) => setQuantity(entry.key, quantity)}
            label={`${copy.quantity.label}, ${product.name}`}
            decreaseLabel={copy.quantity.decrease}
            increaseLabel={copy.quantity.increase}
            size="sm"
          />
          <p className="text-small tabular-nums text-text-secondary">
            {lineTotal === null ? copy.price.onRequest : format.price(lineTotal)}
          </p>
        </div>
      </div>
    </li>
  );
}

/** Packs, weight and total, with the note that prices are confirmed after ordering. */
export function CartSummaryList({ className }: { className?: string }) {
  const { copy, totals, entries } = useCart();
  const format = useShopFormat();
  const weight = totals.weightPartial
    ? copy.cart.weightPartial.replace("{kg}", format.kg(totals.weightKg))
    : format.kg(totals.weightKg);
  const rows = [
    { label: copy.cart.products, value: String(entries.length) },
    { label: copy.cart.packs, value: String(totals.packs) },
    ...(totals.weighed ? [{ label: copy.cart.weight, value: weight }] : []),
  ];
  return (
    <div className={className}>
      <dl className="space-y-2.5 text-small">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-text-secondary">{row.label}</dt>
            <dd className="text-right tabular-nums text-text">{row.value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3.5">
          <dt className="font-medium text-text">{copy.cart.total}</dt>
          <dd className="text-right text-[1.0625rem] font-medium tabular-nums text-text">{format.price(totals.price)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-caption leading-relaxed text-text-tertiary">{copy.cart.priceNote}</p>
    </div>
  );
}
