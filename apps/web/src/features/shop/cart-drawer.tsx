"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { DialogCloseButton, Drawer } from "@/components/ui/dialog";

import { useCart } from "./cart-context";
import { CartLines, CartSummaryList } from "./cart-lines";
import "./shop.css";

/** Cart panel from the right: opens after "Add to cart" and from the header's cart button. */
export function CartDrawer() {
  const { copy, entries, drawerOpen, setDrawerOpen, links } = useCart();
  const close = () => setDrawerOpen(false);

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} label={copy.cart.title} width="md">
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
          <h2 className="flex items-center gap-2.5 text-h4 text-text">
            {copy.cart.title}
            {entries.length > 0 && (
              <span className="rounded-xs bg-surface-muted px-1.5 py-0.5 text-caption tabular-nums text-text-secondary">
                {entries.length}
              </span>
            )}
          </h2>
          <DialogCloseButton autoFocus label={copy.cart.continue} onClick={close} />
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-sm bg-surface-muted text-text-tertiary">
              <ShoppingBag aria-hidden className="size-6" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-[1.0625rem] font-medium text-text">{copy.cart.empty}</p>
              <p className="mt-1.5 text-small text-text-secondary">{copy.cart.emptyText}</p>
            </div>
            <ButtonLink href={links.products} onClick={close} variant="secondary" className="mt-2">
              {copy.cart.browse}
            </ButtonLink>
          </div>
        ) : (
          <>
            <div className="flex-1 px-6">
              <CartLines compact onNavigate={close} />
            </div>
            <div className="sticky bottom-0 border-t border-border bg-background px-6 pb-6 pt-5">
              <CartSummaryList />
              <div className="mt-5 grid gap-2.5">
                <ButtonLink
                  href={links.checkout}
                  onClick={close}
                  variant="accent"
                  size="lg"
                  trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
                >
                  {copy.cart.checkout}
                </ButtonLink>
                <ButtonLink href={links.cart} onClick={close} variant="secondary">
                  {copy.cart.view}
                </ButtonLink>
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}

/** Header button: bag icon with the number of packs in the cart. */
export function CartButton() {
  const { copy, totals, ready, setDrawerOpen, drawerOpen } = useCart();
  const count = ready ? totals.packs : 0;
  const label = count ? copy.cart.openCount.replace("{n}", String(count)) : copy.cart.open;
  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      aria-label={label}
      title={copy.cart.open}
      aria-haspopup="dialog"
      aria-expanded={drawerOpen}
      className="relative inline-flex size-10 items-center justify-center rounded-sm text-text-secondary transition-colors duration-150 hover:bg-surface-muted hover:text-text"
    >
      <ShoppingBag aria-hidden className="size-[1.125rem]" strokeWidth={1.5} />
      {count > 0 && (
        <span
          key={count}
          aria-hidden
          className="sh-badge absolute right-0.5 top-0.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-xs bg-brand px-1 text-[0.6875rem] font-semibold tabular-nums leading-none text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
