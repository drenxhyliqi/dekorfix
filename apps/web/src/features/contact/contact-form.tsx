"use client";

import type { ContactTopic } from "@dekorfix/shared";
import { ArrowRight, Building2, Check, CircleAlert, Globe2, MessageCircle, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";

import { Field } from "@/components/forms/field";
import { Input } from "@/components/forms/input";
import { Textarea } from "@/components/forms/textarea";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

import { sendMessage, type ContactForm as FormData } from "./send-message";

type Copy = Dictionary["contactPage"]["form"];

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^\+?[0-9 ()./-]{6,}$/;
const MAX_MESSAGE = 2000;
const TOPICS: Array<{ id: ContactTopic; icon: typeof Package }> = [
  { id: "products", icon: Package },
  { id: "project", icon: Building2 },
  { id: "order", icon: ShoppingBag },
  { id: "export", icon: Globe2 },
  { id: "other", icon: MessageCircle },
];

type FieldName = "name" | "reach" | "phone" | "email" | "message";

interface Props {
  locale: "sq" | "en";
  copy: Copy;
  privacyHref: string;
  contact: { phone: string; email: string };
}

/** The form with the topic from the link (e.g. ?topic=project from Project Studio). */
export function ContactFormFromUrl(props: Props) {
  const topic = useSearchParams().get("topic");
  const initial = TOPICS.some((entry) => entry.id === topic) ? (topic as ContactTopic) : undefined;
  return <ContactForm {...props} initialTopic={initial} />;
}

/** Contact form: topic chips, name, a way back (phone and/or email), message. Sent through the API. */
export function ContactForm({ locale, copy, privacyHref, contact, initialTopic = "products" }: Props & { initialTopic?: ContactTopic }) {
  const empty: FormData = { locale, topic: initialTopic, name: "", phone: "", email: "", company: "", city: "", message: "", website: "" };
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [failure, setFailure] = useState<"invalid" | "unavailable" | null>(null);
  const [sent, setSent] = useState<{ reference: string; name: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof FormData) => (event: { target: { value: string } }) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === "phone" || field === "email" ? { reach: undefined } : {}),
    }));
  };

  const validate = () => {
    const found: Partial<Record<FieldName, string>> = {};
    const phone = form.phone.trim();
    const email = form.email.trim();
    if (!form.name.trim()) found.name = copy.errors.name;
    if (!phone && !email) found.reach = copy.errors.reach;
    if (phone && !PHONE.test(phone)) found.phone = copy.errors.phone;
    if (email && !EMAIL.test(email)) found.email = copy.errors.email;
    if (form.message.trim().length < 10) found.message = copy.errors.message;
    return found;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setFailure(null);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => {
        const invalid = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
        (invalid ?? phoneRef.current)?.focus();
      });
      return;
    }
    const trimmed = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
    ) as FormData;
    startTransition(async () => {
      const result = await sendMessage(trimmed).catch(() => ({ ok: false, error: "unavailable" }) as const);
      if (result.ok) {
        setSent({ reference: result.reference, name: trimmed.name.split(" ")[0] ?? trimmed.name });
        requestAnimationFrame(() => doneRef.current?.focus());
      } else {
        setFailure(result.error);
      }
    });
  };

  if (sent) {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="ct-done outline-none">
        <span aria-hidden className="ct-done-mark">
          <Check className="size-7" strokeWidth={2.25} />
        </span>
        <h3 className="mt-6 text-h3 text-text">{copy.success.title.replace("{name}", sent.name)}</h3>
        <p className="mt-3 max-w-md text-lead text-text-secondary">{copy.success.text}</p>
        <p className="mt-6 flex w-fit items-center gap-3 rounded-sm border border-border bg-surface-muted px-4 py-3 text-small">
          <span className="text-text-tertiary">{copy.success.reference}</span>
          <span className="font-semibold tabular-nums tracking-wide text-text">{sent.reference}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(null);
            setForm({ ...empty, topic: form.topic });
          }}
          className="mt-8 flex items-center gap-2 text-[0.9375rem] font-medium text-text underline-offset-4 hover:underline"
        >
          {copy.success.another}
          <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid gap-6">
      <fieldset>
        <legend className="mb-3 text-small font-medium text-text">{copy.topic}</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map(({ id, icon: Icon }) => (
            <label key={id} className="ct-topic">
              <input
                type="radio"
                name="topic"
                value={id}
                checked={form.topic === id}
                onChange={() => setForm((current) => ({ ...current, topic: id }))}
                className="sr-only"
              />
              <Icon aria-hidden className="size-4" strokeWidth={1.75} />
              {copy.topics[id]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={copy.name} required error={errors.name} className="sm:col-span-2">
          <Input value={form.name} onChange={update("name")} autoComplete="name" maxLength={120} />
        </Field>
        <Field label={copy.phone} error={errors.phone}>
          <Input
            ref={phoneRef}
            type="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" inputMode="tel" maxLength={40} />
        </Field>
        <Field label={copy.email} error={errors.email}>
          <Input type="email" value={form.email} onChange={update("email")} autoComplete="email" maxLength={254} />
        </Field>
        <p
          className={cn("-mt-2 flex items-start gap-1.5 text-small sm:col-span-2", errors.reach ? "text-danger" : "text-text-tertiary")}
          role={errors.reach ? "alert" : undefined}
        >
          {errors.reach && <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />}
          {errors.reach ?? copy.reach}
        </p>
        <Field label={copy.company} optionalLabel={copy.optional}>
          <Input value={form.company} onChange={update("company")} autoComplete="organization" maxLength={240} />
        </Field>
        <Field label={copy.city} optionalLabel={copy.optional}>
          <Input value={form.city} onChange={update("city")} autoComplete="address-level2" maxLength={120} />
        </Field>
        <Field label={copy.message} required error={errors.message} className="sm:col-span-2">
          <Textarea
            value={form.message}
            onChange={update("message")}
            placeholder={copy.messagePlaceholder}
            rows={6}
            maxLength={MAX_MESSAGE}
          />
        </Field>
        <p aria-hidden className="-mt-3 text-right text-caption tabular-nums text-text-tertiary sm:col-span-2">
          {form.message.length}/{MAX_MESSAGE}
        </p>
      </div>

      {/* Bots fill every field; people never see this one. */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={update("website")} />
        </label>
      </div>

      {failure && (
        <p role="alert" className="flex items-start gap-2 rounded-sm border border-danger/40 bg-danger/5 px-4 py-3 text-small text-text">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={1.75} />
          {failure === "invalid"
            ? copy.errors.invalid
            : copy.errors.unavailable.replace("{phone}", contact.phone).replace("{email}", contact.email)}
        </p>
      )}

      <div className="flex flex-col-reverse gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-small text-text-tertiary">
          {fill(copy.privacy, {
            privacy: (
              <Link href={privacyHref} className="underline underline-offset-4 hover:text-text">
                {copy.privacyLink}
              </Link>
            ),
          })}
        </p>
        <button type="submit" disabled={pending} className="ct-send">
          {pending ? copy.sending : copy.send}
          <ArrowRight aria-hidden className={cn("size-4 transition-transform duration-250", pending && "translate-x-1 opacity-50")} strokeWidth={1.75} />
        </button>
      </div>
    </form>
  );
}

/** Puts React nodes into a sentence's {placeholders}. */
function fill(text: string, values: Record<string, ReactNode>): ReactNode[] {
  return text.split(/(\{\w+\})/).map((part, index) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1];
    return key && key in values ? <span key={index}>{values[key]}</span> : part;
  });
}
