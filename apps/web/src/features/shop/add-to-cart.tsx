"use client";

import { Plus, ShoppingBag } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { packPrice } from "@/content/shop";
import { cn } from "@/lib/utils";

import { useCart, useShopFormat } from "./cart-context";
import { QuantityStepper } from "./quantity-stepper";

/** Squared radio chips for a product's pack sizes. */
function PackPicker({
  packs,
  value,
  onChange,
  legend,
  size = "md",
}: {
  packs: Array<number | null>;
  value: number | null;
  onChange: (packKg: number | null) => void;
  legend: string;
  size?: "sm" | "md";
}) {
  const name = useId();
  const format = useShopFormat();
  return (
    <fieldset>
      <legend className={size === "sm" ? "sr-only" : "mb-3 text-label uppercase text-text-tertiary"}>{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {packs.map((packKg) => (
          <label key={packKg ?? "none"} className="sh-pack">
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={packKg === value}
              onChange={() => onChange(packKg)}
            />
            <span className={cn("sh-pack-face tabular-nums", size === "sm" && "sh-pack-face--sm")}>
              {format.pack(packKg)}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Product page: pack size, quantity and the add button, with the price (or "on request"). */
export function AddToCart({ slug }: { slug: string }) {
  const { products, copy, add } = useCart();
  const format = useShopFormat();
  const product = products.find((entry) => entry.slug === slug);
  const packs = product?.packs ?? [null];
  const [packKg, setPackKg] = useState<number | null>(packs[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  if (!product) return null;
  const price = packPrice(slug, packKg);

  return (
    <div className="space-y-6">
      <p className="flex items-baseline gap-2">
        <span className="text-h3 tabular-nums text-text">{format.price(price)}</span>
        {price !== null && <span className="text-small text-text-tertiary">{copy.price.perPack}</span>}
      </p>

      {packs.length > 1 || packs[0] !== null ? (
        <PackPicker packs={packs} value={packKg} onChange={setPackKg} legend={copy.pack.label} />
      ) : (
        <p className="text-small text-text-secondary">
          <span className="text-label uppercase text-text-tertiary">
            {product.unit === "roll" ? copy.pack.rollLabel : copy.pack.label}
          </span>
          <span className="mt-2 block">{product.unit === "roll" ? copy.pack.rollNote : copy.pack.unconfirmedNote}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          label={copy.quantity.label}
          decreaseLabel={copy.quantity.decrease}
          increaseLabel={copy.quantity.increase}
          className="h-13"
        />
        <Button
          variant="accent"
          size="lg"
          className="min-w-52 flex-1"
          leadingIcon={<ShoppingBag aria-hidden className="size-[1.125rem]" strokeWidth={1.75} />}
          onClick={() => {
            add(slug, packKg, quantity);
            setQuantity(1);
          }}
        >
          {copy.add}
        </Button>
      </div>
      {packKg !== null && quantity > 1 && (
        <p className="-mt-3 text-small tabular-nums text-text-tertiary">
          {quantity} × {format.pack(packKg)} = {format.kg(quantity * packKg)}
        </p>
      )}
    </div>
  );
}

/** Catalog card footer: pack sizes (when there is a choice) and a one-tap add. */
export function QuickAdd({ slug }: { slug: string }) {
  const { products, copy, add } = useCart();
  const format = useShopFormat();
  const product = products.find((entry) => entry.slug === slug);
  const packs = product?.packs ?? [null];
  const [packKg, setPackKg] = useState<number | null>(packs[0] ?? null);
  if (!product) return null;

  return (
    <div className="mt-4 flex w-full flex-1 flex-col justify-end gap-3">
      {packs.length > 1 ? (
        <PackPicker packs={packs} value={packKg} onChange={setPackKg} legend={copy.pack.label} size="sm" />
      ) : (
        <p className="flex h-8 items-center text-small tabular-nums text-text-tertiary">
          {format.packLine(product.unit, packKg)}
        </p>
      )}
      <p className="text-small text-text-secondary">{format.price(packPrice(slug, packKg))}</p>
      <button
        type="button"
        onClick={() => add(slug, packKg, 1)}
        aria-label={copy.addNamed.replace("{name}", product.name)}
        className="sh-add"
      >
        <Plus aria-hidden className="size-4" strokeWidth={2} />
        {copy.add}
      </button>
    </div>
  );
}
