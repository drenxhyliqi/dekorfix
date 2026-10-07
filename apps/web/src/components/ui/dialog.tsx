"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Heading, Text } from "./typography";

interface DialogBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Accessible name when no visible title is rendered. */
  label?: string;
  closeLabel?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Built on the native <dialog> element: focus trapping, Escape handling, the
 * inert background and the top layer come from the browser.
 */
function DialogBase({
  variant,
  open,
  onOpenChange,
  title,
  description,
  label,
  closeLabel = "Close",
  className,
  children,
  side = "right",
}: DialogBaseProps & { variant: "modal" | "drawer"; side?: "left" | "right" }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      data-variant={variant}
      data-side={variant === "drawer" ? side : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : label}
      aria-describedby={description ? descriptionId : undefined}
      onClose={() => onOpenChange(false)}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        // A click on the <dialog> element itself is a click on the backdrop.
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
      className={cn(
        "dfx-dialog bg-background p-0 text-text",
        // Each variant sets its own size so no utilities conflict.
        variant === "modal" &&
          "inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl rounded-sm shadow-lg",
        variant === "drawer" && "m-0 inset-y-0 h-dvh max-h-none max-w-none shadow-lg",
        variant === "drawer" && (side === "right" ? "right-0 left-auto" : "left-0 right-auto"),
        className,
      )}
    >
      <div className="flex h-full flex-col">
        {(title || description) && (
          <header className="flex items-start justify-between gap-6 border-b border-border px-6 py-5 md:px-8">
            <div className="space-y-1.5">
              {title && (
                <Heading as="h2" size="h4" id={titleId}>
                  {title}
                </Heading>
              )}
              {description && (
                <Text size="small" className="max-w-prose" as="div">
                  <span id={descriptionId}>{description}</span>
                </Text>
              )}
            </div>
            <DialogCloseButton label={closeLabel} onClick={() => onOpenChange(false)} />
          </header>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}

export function DialogCloseButton({
  label,
  onClick,
  className,
  autoFocus,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <button
      type="button"
      autoFocus={autoFocus}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "-mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-text-secondary transition-colors duration-150 hover:bg-surface-muted hover:text-text",
        className,
      )}
    >
      <X aria-hidden className="size-5" strokeWidth={1.5} />
    </button>
  );
}

export type ModalProps = DialogBaseProps;

export function Modal(props: ModalProps) {
  return <DialogBase variant="modal" {...props} />;
}

const drawerWidths = { sm: "w-72", md: "w-full sm:w-md", lg: "w-full sm:w-lg" } as const;

export interface DrawerProps extends DialogBaseProps {
  /** `sm` is a fixed 288px panel; `md`/`lg` are full-width on phones. */
  width?: keyof typeof drawerWidths;
  side?: "left" | "right";
}

/** Panel sliding in from the screen edge (right by default). */
export function Drawer({ width = "md", side = "right", className, ...props }: DrawerProps) {
  return (
    <DialogBase
      variant="drawer"
      side={side}
      className={cn(drawerWidths[width], className)}
      {...props}
    />
  );
}
