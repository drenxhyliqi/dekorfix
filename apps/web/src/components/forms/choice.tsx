"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const boxBase =
  "peer relative mt-0.5 size-5 shrink-0 appearance-none border border-border-strong bg-surface " +
  "transition-[background-color,border-color] duration-150 hover:border-text-tertiary " +
  "checked:border-inverse checked:bg-inverse focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-danger";

interface ChoiceProps extends Omit<ComponentProps<"input">, "type"> {
  label: ReactNode;
  description?: ReactNode;
}

function Choice({
  type,
  label,
  description,
  className,
  id,
  ...props
}: ChoiceProps & { type: "checkbox" | "radio" }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span className="relative flex">
        <input
          type={type}
          id={inputId}
          aria-describedby={descriptionId}
          className={cn(boxBase, type === "checkbox" ? "rounded-xs" : "rounded-full")}
          {...props}
        />
        {type === "checkbox" ? (
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="pointer-events-none absolute inset-0 mt-0.5 size-5 text-inverse-text opacity-0 peer-checked:opacity-100"
          >
            <path d="M5.5 10.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.75" />
          </svg>
        ) : (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1.5 top-2 size-2 rounded-full bg-inverse-text opacity-0 peer-checked:opacity-100"
          />
        )}
      </span>
      <span className="flex flex-col gap-0.5">
        <label htmlFor={inputId} className="cursor-pointer text-[0.9375rem] leading-snug text-text">
          {label}
        </label>
        {description && (
          <span id={descriptionId} className="text-small text-text-tertiary">
            {description}
          </span>
        )}
      </span>
    </div>
  );
}

export function Checkbox(props: ChoiceProps) {
  return <Choice type="checkbox" {...props} />;
}

export function Radio(props: ChoiceProps) {
  return <Choice type="radio" {...props} />;
}

/** Group of radios/checkboxes with a visible legend. */
export function ChoiceGroup({
  legend,
  description,
  error,
  required,
  className,
  children,
}: {
  legend: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className={cn("flex flex-col gap-4", className)} aria-invalid={error ? true : undefined}>
      <legend className="mb-1 text-small font-medium text-text">
        {legend}
        {required && (
          <span aria-hidden className="ml-0.5 text-brand">
            *
          </span>
        )}
      </legend>
      {description && <p className="-mt-2 text-small text-text-tertiary">{description}</p>}
      <div className="flex flex-col gap-3">{children}</div>
      {error && <p className="text-small text-danger">{error}</p>}
    </fieldset>
  );
}
