"use client";

import { ArrowUp, RotateCcw, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";

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

/**
 * The "Ask Dekorfix" assistant: a button in the corner that opens a chat. The
 * conversation lives in this component (mounted by the layout), so it survives
 * moving between pages; it is not stored anywhere.
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
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  };

  // Escape closes; on phones the chat fills the screen, so the page behind stops scrolling.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
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

  // Keep the newest message in view while a reply streams in.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

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
        body: JSON.stringify({ locale, messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        fail(
          response.status === 429
            ? copy.errors.rateLimited
            : copy.errors.unavailable.replace("{phone}", contact.phone).replace("{email}", contact.email),
        );
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
      if (!reply.trim()) fail(copy.errors.unavailable.replace("{phone}", contact.phone).replace("{email}", contact.email));
    } catch {
      if (!controller.signal.aborted) fail(copy.errors.unavailable.replace("{phone}", contact.phone).replace("{email}", contact.email));
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
        className="as-launcher"
      >
        <span aria-hidden className="as-launcher-icon">
          <Sparkles className="size-[1.125rem]" strokeWidth={1.75} />
        </span>
        <span className="as-launcher-label">{copy.launcher}</span>
      </button>

      {open && (
        <section role="dialog" aria-modal="false" aria-labelledby="assistant-title" className="as-panel">
          <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
            <span aria-hidden className="as-avatar">
              <span className="as-avatar-mark" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="assistant-title" className="text-[0.9375rem] font-semibold text-text">
                {copy.title}
              </h2>
              <p className="flex items-center gap-1.5 truncate text-caption text-text-tertiary">
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
            <Bubble role="assistant">{copy.welcome}</Bubble>
            {messages.length === 0 && (
              <div className="as-suggestions">
                {copy.suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void ask(suggestion)}
                    className="as-suggestion"
                    style={{ animationDelay: `${180 + index * 70}ms` }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {messages.map((message, index) =>
              message.role === "assistant" && !message.content ? (
                <div key={index} className="as-typing" aria-label={copy.thinking}>
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                <Bubble key={index} role={message.role} error={message.error}>
                  {message.role === "assistant" ? <Rich text={message.content} onNavigate={close} /> : message.content}
                </Bubble>
              ),
            )}
          </div>

          <form onSubmit={submit} className="shrink-0 border-t border-border p-3">
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
                <ArrowUp aria-hidden className="size-4" strokeWidth={2} />
              </button>
            </div>
            <p className="mt-2 px-1 text-[0.6875rem] leading-snug text-text-tertiary">{copy.disclaimer}</p>
          </form>
        </section>
      )}
    </>
  );
}

function Bubble({ role, error, children }: { role: Message["role"]; error?: boolean; children: ReactNode }) {
  return <div className={cn("as-bubble", role === "user" ? "as-bubble--user" : "as-bubble--bot", error && "as-bubble--error")}>{children}</div>;
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
      {parseRich(text, OWN_HOSTS).map((block, index) =>
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
