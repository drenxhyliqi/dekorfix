"use client";

import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";

import { Field } from "@/components/forms/field";
import { Input } from "@/components/forms/input";
import { Textarea } from "@/components/forms/textarea";
import { Button, ButtonLink } from "@/components/ui/button";
import { company } from "@/config/site";
import { cn } from "@/lib/utils";

import { useCart, useShopFormat } from "./cart-context";
import { CartSummaryList } from "./cart-lines";
import { CartEmpty, CartLoading } from "./cart-view";
import { placeOrder, type OrderForm } from "./place-order";
import "./shop.css";

type FieldName = "name" | "phone" | "email" | "city" | "address" | "consent";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^\+?[0-9 ()./-]{6,}$/;

/** Fills `{token}` placeholders in a sentence with elements (e.g. links). */
function fill(sentence: string, parts: Record<string, ReactNode>): ReactNode[] {
  return sentence.split(/(\{\w+\})/).map((piece, index) => {
    const key = piece.slice(1, -1);
    return piece.startsWith("{") && key in parts ? <span key={index}>{parts[key]}</span> : piece;
  });
}

/** Checkout: contact and delivery details beside the order summary; sends the order to Dekorfix. */
export function CheckoutView() {
  const { copy: shop, entries, ready, locale, clear, links } = useCart();
  const copy = shop.checkout;
  const [form, setForm] = useState<OrderForm>({
    locale,
    name: "",
    phone: "",
    email: "",
    company: "",
    businessNumber: "",
    delivery: "delivery",
    city: "",
    address: "",
    notes: "",
    website: "",
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [failure, setFailure] = useState<"invalid" | "unavailable" | null>(null);
  const [placed, setPlaced] = useState<{ reference: string; email: string; phone: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  if (placed) return <OrderPlaced {...placed} />;
  const header = (
    <div className="mb-10 mt-8 max-w-3xl md:mb-14 md:mt-12">
      <h1 className="text-[clamp(2.5rem,1.5rem+4vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-text">
        {copy.title}
      </h1>
      <p className="mt-5 text-lead text-text-secondary">{copy.intro}</p>
    </div>
  );
  if (!ready || !entries.length) {
    return (
      <>
        {header}
        {ready ? <CartEmpty /> : <CartLoading />}
      </>
    );
  }

  const update = (field: keyof OrderForm) => (event: { target: { value: string } }) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (field in errors) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const found: Partial<Record<FieldName, string>> = {};
    if (!form.name.trim()) found.name = copy.errors.required;
    if (!form.phone.trim()) found.phone = copy.errors.required;
    else if (!PHONE.test(form.phone.trim())) found.phone = copy.errors.phone;
    if (!form.email.trim()) found.email = copy.errors.required;
    else if (!EMAIL.test(form.email.trim())) found.email = copy.errors.email;
    if (form.delivery === "delivery") {
      if (!form.city.trim()) found.city = copy.errors.required;
      if (!form.address.trim()) found.address = copy.errors.required;
    }
    if (!consent) found.consent = copy.errors.consent;
    return found;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setFailure(null);
    if (Object.keys(found).length) {
      // Focus the first field that needs attention.
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    const trimmed = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
    ) as OrderForm;
    startTransition(async () => {
      const result = await placeOrder(
        trimmed,
        entries.map(({ slug, packKg, quantity }) => ({ slug, packKg, quantity })),
      ).catch(() => ({ ok: false, error: "unavailable" }) as const);
      if (result.ok) {
        setPlaced({ reference: result.reference, email: trimmed.email, phone: trimmed.phone });
        clear();
        window.scrollTo({ top: 0, behavior: "instant" });
      } else {
        setFailure(result.error);
      }
    });
  };

  return (
    <>
      {header}
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <form ref={formRef} onSubmit={submit} noValidate className="lg:col-span-7">
          <CheckoutSection number={1} title={copy.contact}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={copy.name} required error={errors.name} className="sm:col-span-2">
                <Input value={form.name} onChange={update("name")} autoComplete="name" />
              </Field>
              <Field label={copy.phone} required error={errors.phone}>
                <Input type="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" inputMode="tel" />
              </Field>
              <Field label={copy.email} required error={errors.email}>
                <Input type="email" value={form.email} onChange={update("email")} autoComplete="email" />
              </Field>
              <Field label={copy.company} optionalLabel={copy.optional}>
                <Input value={form.company} onChange={update("company")} autoComplete="organization" />
              </Field>
              <Field label={copy.businessNumber} optionalLabel={copy.optional}>
                <Input value={form.businessNumber} onChange={update("businessNumber")} />
              </Field>
            </div>
          </CheckoutSection>

          <CheckoutSection number={2} title={copy.delivery}>
            <fieldset>
              <legend className="sr-only">{copy.delivery}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["delivery", "pickup"] as const).map((method) => (
                  <label key={method} className="sh-method">
                    <input
                      type="radio"
                      name="delivery"
                      value={method}
                      checked={form.delivery === method}
                      onChange={() => setForm((current) => ({ ...current, delivery: method }))}
                      className="sh-method-input"
                    />
                    <span className="text-[0.9375rem] font-medium text-text">{copy.methods[method].label}</span>
                    <span className="mt-1 block text-small text-text-secondary">{copy.methods[method].text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {form.delivery === "delivery" && (
              <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_2fr]">
                <Field label={copy.city} required error={errors.city}>
                  <Input value={form.city} onChange={update("city")} autoComplete="address-level2" />
                </Field>
                <Field label={copy.address} required error={errors.address}>
                  <Input value={form.address} onChange={update("address")} autoComplete="street-address" />
                </Field>
              </div>
            )}
            <Field label={copy.notes} optionalLabel={copy.optional} className="mt-6">
              <Textarea value={form.notes} onChange={update("notes")} placeholder={copy.notesPlaceholder} rows={4} maxLength={2000} />
            </Field>
          </CheckoutSection>

          {/* Bots fill every field; people never see this one. */}
          <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={form.website} onChange={update("website")} />
            </label>
          </div>

          <div className="mt-10 border-t border-border pt-8">
            <label className="flex items-start gap-3 text-[0.9375rem] leading-snug text-text">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  setErrors((current) => ({ ...current, consent: undefined }));
                }}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? "consent-error" : undefined}
                className="sh-check mt-0.5"
              />
              <span>
                {fill(copy.consent, {
                  terms: (
                    <Link href={links.terms} target="_blank" className="underline underline-offset-4">
                      {copy.terms}
                    </Link>
                  ),
                  privacy: (
                    <Link href={links.privacy} target="_blank" className="underline underline-offset-4">
                      {copy.privacy}
                    </Link>
                  ),
                })}
              </span>
            </label>
            {errors.consent && (
              <p id="consent-error" className="mt-2 flex items-start gap-1.5 text-small text-danger">
                <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
                {errors.consent}
              </p>
            )}

            {failure && (
              <p role="alert" className="mt-6 flex items-start gap-2.5 rounded-sm border border-danger/40 bg-brand-soft px-4 py-3 text-small text-text">
                <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={1.75} />
                {failure === "invalid" ? copy.errors.invalid : copy.errors.unavailable.replace("{phone}", company.phones[0].display)}
              </p>
            )}

            <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href={links.cart} className="group/back inline-flex items-center gap-2 text-small font-medium text-text">
                <ArrowLeft
                  aria-hidden
                  className="size-4 transition-transform duration-250 group-hover/back:-translate-x-1"
                  strokeWidth={1.75}
                />
                {copy.edit}
              </Link>
              <Button
                type="submit"
                variant="accent"
                size="lg"
                disabled={pending}
                aria-disabled={pending}
                trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
              >
                {pending ? copy.sending : copy.submit}
              </Button>
            </div>
          </div>
        </form>

        <aside aria-labelledby="checkout-summary" className="lg:col-span-5">
          <div className="rounded-sm border border-border bg-surface-muted p-6 lg:sticky lg:top-28 md:p-8">
            <h2 id="checkout-summary" className="text-h4 text-text">
              {shop.cart.summary}
            </h2>
            <OrderLines />
            <CartSummaryList className="mt-6" />
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-label uppercase text-text-tertiary">{copy.nextTitle}</h3>
              <ol className="mt-4 space-y-3">
                {copy.next.map((step, index) => (
                  <li key={step} className="flex gap-3 text-small text-text-secondary">
                    <span className="w-5 shrink-0 tabular-nums text-text">{index + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function CheckoutSection({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border pt-8 [&+&]:mt-10">
      <h2 className="mb-6 flex items-baseline gap-3 text-h4 text-text">
        <span className="text-small tabular-nums text-brand-text">{String(number).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Compact list of what is being ordered. */
function OrderLines() {
  const { entries } = useCart();
  const format = useShopFormat();
  return (
    <ul className="mt-6 divide-y divide-border border-y border-border">
      {entries.map((entry) => (
        <li key={entry.key} className="flex items-center gap-4 py-3.5">
          <span className="relative size-12 shrink-0 overflow-hidden rounded-xs border border-border bg-background">
            <Image src={entry.product.image} alt="" fill sizes="48px" className="object-contain p-1" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.9375rem] font-medium text-text">{entry.product.name}</span>
            <span className="block text-small tabular-nums text-text-secondary">{format.packLine(entry.product.unit, entry.packKg)}</span>
          </span>
          <span className="shrink-0 text-small tabular-nums text-text">× {entry.quantity}</span>
        </li>
      ))}
    </ul>
  );
}

/** Confirmation after sending: the reference to quote, and how Dekorfix follows up. */
function OrderPlaced({ reference, email, phone }: { reference: string; email: string; phone: string }) {
  const { copy, links } = useCart();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <div className="mx-auto max-w-2xl pb-6 pt-12 text-center md:pt-16">
      <span className="inline-flex size-14 items-center justify-center rounded-sm bg-brand text-white">
        <CircleCheck aria-hidden className="size-7" strokeWidth={1.5} />
      </span>
      <p className="mt-8 text-label uppercase text-brand-text">{copy.success.eyebrow}</p>
      <h1 ref={heading} tabIndex={-1} className="mt-4 text-h2 text-text outline-none">
        {copy.success.title}
      </h1>
      <div className="mx-auto mt-8 inline-flex flex-col items-center rounded-sm border border-border px-8 py-5">
        <span className="text-label uppercase text-text-tertiary">{copy.success.reference}</span>
        <span className="mt-2 font-mono text-h3 tracking-[0.08em] text-text">{reference}</span>
      </div>
      <p className={cn("mx-auto mt-8 max-w-xl text-lead text-text-secondary")}>
        {copy.success.text.replace("{email}", email).replace("{phone}", phone)}
      </p>
      <ButtonLink href={links.products} variant="secondary" size="lg" className="mt-10">
        {copy.success.back}
      </ButtonLink>
    </div>
  );
}
