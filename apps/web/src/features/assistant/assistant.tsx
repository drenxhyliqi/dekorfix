"use client";

import {
  ArrowUp,
  ArrowUpRight,
  Building2,
  Check,
  ChevronRight,
  Globe2,
  LayoutGrid,
  Plus,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";

import { useCart } from "@/features/shop/cart-context";
import type { ShopProduct } from "@/features/shop/shop-products";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

import { parseRich, type Inline } from "./rich-text";
import "./assistant.css";

type Copy = Dictionary["assistant"];

interface Message {
  role: "user" | "assistant";
  content: string;
  /** Set on a reply that failed: shown, but not sent back to the model. */
  error?: boolean;
}

const MAX_CHARS = 500;
/** Hosts whose absolute links are this site (turned into paths). */
const OWN_HOSTS = ["dekorfix.net", "localhost:3000"];
/** Icons for the suggested questions, in their order in the dictionary. */
const SUGGESTION_ICONS: LucideIcon[] = [Building2, LayoutGrid, Globe2, ShoppingBag];

/**
 * The "Ask Dekorfix" assistant: a button in the corner that opens a chat. The
 * conversation lives in this component (mounted by the layout, inside the
 * cart), so it survives moving between pages; it is not stored anywhere.
 * Each question carries the page being viewed, so "this product" works, and
 * products named in a reply come with a card to open or add them.
 */
export function Assistant({
  locale,
  copy,
  contact,
}: {
  locale: Locale;
  copy: Copy;
  contact: { phone: string; email: string };
}) {
  const pathname = usePathname();
  const { products } = useCart();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const pageSlug = /\/products\/([a-z0-9-]+)$/.exec(pathname ?? "")?.[1];
  const pageProduct = products.find((product) => product.slug === pageSlug);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  };

  // Escape closes; on phones the chat fills the screen, so the page behind stops scrolling.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const phone = window.matchMedia("(max-width: 639px)").matches;
    if (phone) document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      if (phone) document.documentElement.style.overflow = "";
    };
  }, [open]);

  // Keep the newest message in view while a reply streams in; the greeting starts at the top.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = messages.length ? log.scrollHeight : 0;
  }, [messages, open]);

  // The composer grows with its text, up to a few lines.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 128)}px`;
  }, [draft, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const unavailable = copy.errors.unavailable.replace("{phone}", contact.phone).replace("{email}", contact.email);

  const ask = async (question: string) => {
    const text = question.trim().slice(0, MAX_CHARS);
    if (!text || busy) return;
    const history = [...messages.filter((message) => !message.error), { role: "user" as const, content: text }];
    setMessages([...messages, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setDraft("");
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const fail = (content: string) =>
      setMessages((current) => [...current.slice(0, -1), { role: "assistant", content, error: true }]);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, page: pathname, messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        fail(response.status === 429 ? copy.errors.rateLimited : unavailable);
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        const snapshot = reply;
        setMessages((current) => [...current.slice(0, -1), { role: "assistant", content: snapshot }]);
      }
      if (!reply.trim()) fail(unavailable);
    } catch {
      if (!controller.signal.aborted) fail(unavailable);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void ask(draft);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter starts a new line.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void ask(draft);
    }
  };
  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setBusy(false);
    inputRef.current?.focus();
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-hidden={open || undefined}
        title={copy.launcher}
        className="as-launcher"
      >
        <Sparkles aria-hidden className="as-launcher-spark" strokeWidth={1.75} />
        <span className="sr-only">{copy.launcher}</span>
      </button>

      {open && (
        <section role="dialog" aria-modal="false" aria-labelledby="assistant-title" className="as-panel">
          <header className="as-head">
            <Avatar size="md" thinking={busy} />
            <div className="min-w-0 flex-1">
              <h2 id="assistant-title" className="text-[0.9375rem] font-semibold leading-tight text-text">
                {copy.title}
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-caption text-text-secondary">
                <span aria-hidden className="as-live" />
                {copy.status}
              </p>
            </div>
            {messages.length > 0 && (
              <button type="button" onClick={reset} aria-label={copy.reset} title={copy.reset} className="as-icon-button">
                <RotateCcw aria-hidden className="size-4" strokeWidth={1.75} />
              </button>
            )}
            <button type="button" onClick={close} aria-label={copy.close} title={copy.close} className="as-icon-button">
              <X aria-hidden className="size-5" strokeWidth={1.5} />
            </button>
          </header>

          <div ref={logRef} role="log" aria-live="polite" aria-relevant="additions" className="as-log">
            {messages.length === 0 ? (
              <div className="as-intro">
                <Avatar size="lg" />
                <p className="mt-5 text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-text">{copy.greeting}</p>
                <p className="mt-2 text-small leading-relaxed text-text-secondary">{copy.welcome}</p>

                {pageProduct && (
                  <button
                    type="button"
                    onClick={() => void ask(copy.contextQuestion.replace("{name}", pageProduct.name))}
                    className="as-context"
                  >
                    <span className="as-thumb">
                      <Image src={pageProduct.image} alt="" fill sizes="48px" className="object-contain p-1" />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-caption uppercase tracking-[0.06em] text-text-tertiary">{copy.contextLabel}</span>
                      <span className="block truncate text-[0.9375rem] font-semibold text-text">{pageProduct.name}</span>
                      <span className="block text-caption font-medium text-brand-text">{copy.contextAsk}</span>
                    </span>
                    <ChevronRight aria-hidden className="size-4 shrink-0 text-text-tertiary" strokeWidth={1.75} />
                  </button>
                )}

                <ul className="mt-4 space-y-2">
                  {copy.suggestions.map((suggestion, index) => {
                    const Icon = SUGGESTION_ICONS[index] ?? Sparkles;
                    return (
                      <li key={suggestion} className="as-rise" style={{ animationDelay: `${120 + index * 60}ms` }}>
                        <button type="button" onClick={() => void ask(suggestion)} className="as-suggestion">
                          <span aria-hidden className="as-suggestion-icon">
                            <Icon className="size-4" strokeWidth={1.75} />
                          </span>
                          <span className="flex-1 text-left">{suggestion}</span>
                          <ArrowUpRight aria-hidden className="as-suggestion-arrow size-4" strokeWidth={1.75} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              messages.map((message, index) => {
                const streaming = busy && index === messages.length - 1;
                if (message.role === "user") {
                  return (
                    <div key={index} className="as-row as-row--user">
                      <div className="as-bubble as-bubble--user">{message.content}</div>
                    </div>
                  );
                }
                const firstOfTurn = messages[index - 1]?.role !== "assistant";
                return (
                  <div key={index} className="as-row as-row--bot">
                    <span aria-hidden className={cn("as-row-avatar", !firstOfTurn && "invisible")}>
                      <Avatar size="sm" />
                    </span>
                    <div className="min-w-0 flex-1">
                      {message.content ? (
                        <div className={cn("as-bubble as-bubble--bot", message.error && "as-bubble--error")}>
                          <Rich text={message.content} onNavigate={close} />
                        </div>
                      ) : (
                        <div className="as-bubble as-bubble--bot as-typing" aria-label={copy.thinking}>
                          <span />
                          <span />
                          <span />
                        </div>
                      )}
                      {!streaming && !message.error && message.content && (
                        <ProductCards text={message.content} products={products} copy={copy} onNavigate={close} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={submit} className="as-foot">
            <div className="as-composer">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, MAX_CHARS))}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder={copy.placeholder}
                aria-label={copy.placeholder}
                className="as-input"
              />
              <button type="submit" disabled={!draft.trim() || busy} aria-label={copy.send} className="as-send">
                <ArrowUp aria-hidden className="size-4" strokeWidth={2.25} />
              </button>
            </div>
            <p className="mt-2 px-1 text-center text-[0.6875rem] leading-snug text-text-tertiary">{copy.disclaimer}</p>
          </form>
        </section>
      )}
    </>
  );
}

/** The assistant's face: a small Dekorfix robot in a circle. Its eyes scan while a reply is written. */
function Avatar({ size, thinking = false }: { size: "sm" | "md" | "lg"; thinking?: boolean }) {
  return (
    <span aria-hidden className={cn("as-avatar", `as-avatar--${size}`)} data-thinking={thinking || undefined}>
      <RobotHead />
    </span>
  );
}

/** Head with an antenna, a dark visor with red eyes, and the brand's parallelogram on the chin. */
function RobotHead() {
  return (
    <svg viewBox="0 0 64 64" className="as-robot">
      <line x1="32" y1="5" x2="32" y2="15" className="as-robot-line" />
      <circle cx="32" cy="6" r="4.5" className="as-robot-tip" />
      <rect x="4.5" y="29" width="7" height="14" rx="3" className="as-robot-ear" />
      <rect x="52.5" y="29" width="7" height="14" rx="3" className="as-robot-ear" />
      <rect x="10.5" y="15" width="43" height="39" rx="13" className="as-robot-head" />
      <rect x="16" y="23" width="32" height="17" rx="8.5" className="as-robot-visor" />
      <g className="as-robot-eyes">
        <rect x="22.5" y="27.5" width="6" height="8" rx="3" className="as-robot-eye" />
        <rect x="35.5" y="27.5" width="6" height="8" rx="3" className="as-robot-eye" />
      </g>
      <path d="M29 45.5h8.5l-2 3.5H27z" className="as-robot-mark" />
    </svg>
  );
}

/** Products a reply names (by link or in bold), as cards to open or add to the cart. */
function ProductCards({
  text,
  products,
  copy,
  onNavigate,
}: {
  text: string;
  products: ShopProduct[];
  copy: Copy;
  onNavigate: () => void;
}) {
  const named = new Set<string>();
  for (const match of text.matchAll(/\/(?:sq|en)\/products\/([a-z0-9-]+)/g)) if (match[1]) named.add(match[1]);
  for (const match of text.matchAll(/\*\*([^*]+)\*\*/g)) {
    const name = match[1]?.trim().toLowerCase();
    const product = products.find((entry) => entry.name.toLowerCase() === name);
    if (product) named.add(product.slug);
  }
  const shown = [...named].map((slug) => products.find((product) => product.slug === slug)).filter(Boolean).slice(0, 3);
  if (!shown.length) return null;
  return (
    <ul className="mt-2 space-y-1.5">
      {shown.map((product) => product && <ProductCard key={product.slug} product={product} copy={copy} onNavigate={onNavigate} />)}
    </ul>
  );
}

function ProductCard({ product, copy, onNavigate }: { product: ShopProduct; copy: Copy; onNavigate: () => void }) {
  const { add, copy: shop } = useCart();
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <li className="as-card">
      <Link href={product.href} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="as-thumb">
          <Image src={product.image} alt="" fill sizes="48px" className="object-contain p-1" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-small font-semibold text-text">{product.name}</span>
          <span className="block truncate text-caption text-text-tertiary">{product.categoryLabel}</span>
        </span>
      </Link>
      <Link href={product.href} onClick={onNavigate} className="as-card-link">
        {copy.view}
      </Link>
      <button
        type="button"
        onClick={() => {
          add(product.slug, product.packs[0] ?? null, 1);
          setAdded(true);
        }}
        aria-label={shop.addNamed.replace("{name}", product.name)}
        title={shop.add}
        className={cn("as-card-add", added && "as-card-add--done")}
      >
        {added ? <Check aria-hidden className="size-4" strokeWidth={2} /> : <Plus aria-hidden className="size-4" strokeWidth={2} />}
        <span className="sr-only" aria-live="polite">
          {added ? copy.added : ""}
        </span>
      </button>
    </li>
  );
}

/** A reply's markdown, with links only to real pages of this site. */
function Rich({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const inline = (pieces: Inline[]) =>
    pieces.map((piece, index) => {
      if (piece.kind === "bold") return <strong key={index}>{piece.text}</strong>;
      if (piece.kind === "text") return <Fragment key={index}>{piece.text}</Fragment>;
      if (piece.href.startsWith("/"))
        return (
          <Link key={index} href={piece.href} onClick={onNavigate}>
            {piece.text}
          </Link>
        );
      return (
        <a key={index} href={piece.href}>
          {piece.text}
        </a>
      );
    });
  return (
    <>
      {parseRich(text, OWN_HOSTS).map(
        (block, index): ReactNode =>
          block.kind === "paragraph" ? (
            <p key={index}>{inline(block.content)}</p>
          ) : (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{inline(item)}</li>
              ))}
            </ul>
          ),
      )}
    </>
  );
}
