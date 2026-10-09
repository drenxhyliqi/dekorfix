"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminRoutes } from "@/config/routes";
import { ApiError, apiRequest } from "@/lib/api";

import { ADMIN_COOKIE, safeNext } from "./session";

export interface SignInState {
  error: "invalid" | "locked" | "unavailable" | "missing" | null;
  email: string;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Signs in through the API and keeps the session token in an httpOnly cookie. */
export async function signIn(_previous: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!EMAIL.test(email) || !password) return { error: "missing", email };

  let session: { token: string; expires_at: string };
  try {
    session = await apiRequest("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { error: "invalid", email };
    if (error instanceof ApiError && error.status === 429) return { error: "locked", email };
    if (error instanceof ApiError && error.status === 422) return { error: "missing", email };
    console.error("Admin sign-in failed", error);
    return { error: "unavailable", email };
  }

  (await cookies()).set(ADMIN_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expires_at),
  });
  redirect(safeNext(form.get("next")));
}

/** Ends the session in the API and removes the cookie. */
export async function signOut(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) {
    await apiRequest("/api/v1/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => undefined);
  }
  store.delete(ADMIN_COOKIE);
  redirect(adminRoutes.login);
}
