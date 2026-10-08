"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

/** Copies `value` to the clipboard and confirms for a moment. */
export function CopyButton({
  value,
  label,
  copiedLabel,
  name,
}: {
  value: string;
  label: string;
  copiedLabel: string;
  /** What is copied, for the accessible name ("Copy +383 44 216 541"). */
  name: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard unavailable (e.g. insecure context): nothing to confirm.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label} ${name}`}
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-sm border border-border-strong px-3.5 text-small font-medium text-text transition-colors duration-150 hover:border-text hover:bg-surface-muted"
    >
      {copied ? (
        <Check aria-hidden className="size-4 text-brand" strokeWidth={2} />
      ) : (
        <Copy aria-hidden className="size-4" strokeWidth={1.75} />
      )}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
