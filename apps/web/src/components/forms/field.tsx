"use client";

import { CircleAlert } from "lucide-react";
import { createContext, useContext, useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FieldContextValue {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** Props a control inside <Field> should spread onto its native element. */
export function useFieldControl<T extends { id?: string; "aria-describedby"?: string; required?: boolean }>(
  props: T,
) {
  const field = useContext(FieldContext);
  if (!field) return { ...props, invalid: false };
  return {
    ...props,
    id: props.id ?? field.id,
    required: props.required ?? field.required,
    "aria-describedby": cn(field.describedBy, props["aria-describedby"]) || undefined,
    "aria-invalid": field.invalid || undefined,
    invalid: field.invalid,
  };
}

export interface FieldProps {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Text shown after the label for optional fields, e.g. "Optional". */
  optionalLabel?: string;
  className?: string;
  children: ReactNode;
}

/** Label + control + description + error, wired together for assistive tech. */
export function Field({
  label,
  description,
  error,
  required = false,
  optionalLabel,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <FieldContext.Provider
      value={{
        id,
        describedBy: cn(descriptionId, errorId) || undefined,
        invalid: Boolean(error),
        required,
      }}
    >
      <div className={cn("flex flex-col gap-2", className)}>
        <label htmlFor={id} className="flex items-baseline justify-between gap-4 text-small font-medium text-text">
          <span>
            {label}
            {required && (
              <span aria-hidden className="ml-0.5 text-brand">
                *
              </span>
            )}
          </span>
          {!required && optionalLabel && (
            <span className="text-caption font-normal text-text-tertiary">{optionalLabel}</span>
          )}
        </label>
        {children}
        {description && (
          <p id={descriptionId} className="text-small text-text-tertiary">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="flex items-start gap-1.5 text-small text-danger">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}

/** Shared visual style of text-like controls (input, select, textarea). */
export const controlClasses =
  "w-full rounded-sm border border-border-strong bg-surface text-body text-text placeholder:text-text-tertiary " +
  "transition-[border-color,box-shadow] duration-150 hover:border-text-tertiary " +
  "focus-visible:border-text focus-visible:shadow-[inset_0_0_0_1px_var(--color-text)] focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-tertiary " +
  "aria-invalid:border-danger aria-invalid:focus-visible:shadow-[inset_0_0_0_1px_var(--color-danger)]";
