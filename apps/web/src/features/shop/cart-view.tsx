"use client";

import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";

import { useCart } from "./cart-context";
import { CartLines, CartSummaryList } from "./cart-lines";
import "./shop.css";

/** Placeholder with the page's shape while the stored cart is read. */
export function CartLoading() {
  return <div aria-hidden className="h-80 animate-pulse rounded-sm bg-surface-muted" />;
}

export function CartEmpty() {
  const { copy, links } = useCart();
  return (
    <div className="flex flex-col items-start gap-5 rounded-sm border border-dashed border-border-strong px-6 py-16 sm:items-center sm:text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-sm bg-surface-muted text-text-tertiary">
        <ShoppingBag aria-hidden className="size-6" strokeWidth={1.5} />
      </span>
      <div>
        <p className="text-h4 text-text">{copy.cart.empty}</p>
        <p className="mt-2 text-small text-text-secondary">{copy.cart.emptyText}</p>
      </div>
      <ButtonLink href={links.products} trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}>
        {copy.cart.browse}
      </ButtonLink>
    </div>
  );
}

/** The cart page: lines on the left, the summary and checkout button pinned on the right. */
export function CartView() {
  const { copy, links, entries, ready, clear } = useCart();
  if (!ready) return <CartLoading />;
  if (!entries.length) return <CartEmpty />;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="border-y border-border">
          <CartLines />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={links.products}
            className="group/back inline-flex items-center gap-2 text-small font-medium text-text"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform duration-250 group-hover/back:-translate-x-1"
              strokeWidth={1.75}
            />
            {copy.cart.continue}
          </Link>
          <button
            type="button"
            onClick={clear}
            className="text-small text-text-secondary underline-offset-4 hover:text-text hover:underline"
          >
            {copy.cart.clear}
          </button>
        </div>
      </div>

      <aside aria-labelledby="cart-summary" className="lg:col-span-5 xl:col-span-4">
        <div className="rounded-sm border border-border bg-surface-muted p-6 lg:sticky lg:top-28 md:p-8">
          <h2 id="cart-summary" className="mb-6 text-h4 text-text">
            {copy.cart.summary}
          </h2>
          <CartSummaryList />
          <ButtonLink
            href={links.checkout}
            variant="accent"
            size="lg"
            className="mt-6 w-full"
            trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
          >
            {copy.cart.checkout}
          </ButtonLink>
        </div>
      </aside>
    </div>
  );
}
