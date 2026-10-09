"use client";

import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

import { signIn, type SignInState } from "./actions";

const ERRORS: Record<NonNullable<SignInState["error"]>, string> = {
  invalid: "Email ose fjalëkalim i gabuar.",
  locked: "Shumë përpjekje. Prisni 15 minuta dhe provoni sërish.",
  unavailable: "Hyrja nuk është e mundur tani. Provoni sërish pas pak.",
  missing: "Shkruani emailin dhe fjalëkalimin.",
};

/** The form with `?next=` from the link the admin was sent from. */
export function LoginFormFromUrl() {
  return <LoginForm next={useSearchParams().get("next")} />;
}

/** Email and password, with show/hide and a Caps Lock hint. Signs in through a server action. */
export function LoginForm({ next }: { next: string | null }) {
  const [state, action, pending] = useActionState(signIn, { error: null, email: "" });
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const checkCaps = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState("CapsLock"));

  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />

      {state.error && (
        <p role="alert" className="lg-alert">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          {ERRORS[state.error]}
        </p>
      )}

      <div className="grid gap-2">
        <label htmlFor="email" className="text-small font-medium text-text">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          defaultValue={state.email}
          // Moves focus here on first load and after a failed attempt.
          autoFocus
          aria-invalid={state.error === "invalid" || state.error === "missing" || undefined}
          className="lg-input"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className="text-small font-medium text-text">
          Fjalëkalimi
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            onKeyUp={checkCaps}
            onKeyDown={checkCaps}
            onBlur={() => setCapsLock(false)}
            aria-invalid={state.error === "invalid" || state.error === "missing" || undefined}
            aria-describedby={capsLock ? "caps-lock" : undefined}
            className="lg-input pr-12"
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Fshih fjalëkalimin" : "Shfaq fjalëkalimin"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-1 my-auto inline-flex size-10 items-center justify-center rounded-sm text-text-tertiary transition-colors hover:text-text"
          >
            {visible ? <EyeOff aria-hidden className="size-[1.125rem]" strokeWidth={1.75} /> : <Eye aria-hidden className="size-[1.125rem]" strokeWidth={1.75} />}
          </button>
        </div>
        {capsLock && (
          <p id="caps-lock" className="lg-caps text-caption font-medium">
            Caps Lock është i ndezur.
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className="lg-submit group/submit mt-2">
        {pending ? (
          <>
            <LoaderCircle aria-hidden className="size-4 animate-spin" strokeWidth={2} />
            Duke hyrë…
          </>
        ) : (
          <>
            Hyni
            <ArrowRight
              aria-hidden
              className={cn("size-4 transition-transform duration-250 group-hover/submit:translate-x-1")}
              strokeWidth={1.75}
            />
          </>
        )}
      </button>
    </form>
  );
}
