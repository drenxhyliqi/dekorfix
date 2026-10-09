"use server";

import type { ContactMessageCreate, ContactMessageCreated, ContactTopic } from "@dekorfix/shared";

import { ApiError, apiRequest } from "@/lib/api";

export interface ContactForm {
  locale: "sq" | "en";
  topic: ContactTopic;
  name: string;
  phone: string;
  email: string;
  company: string;
  city: string;
  message: string;
  /** Hidden from people; a filled value means the form was sent by a bot. */
  website: string;
}

export type SendMessageResult = { ok: true; reference: string } | { ok: false; error: "invalid" | "unavailable" };

const TOPICS: ContactTopic[] = ["products", "project", "order", "export", "other"];

/** Sends a contact message to the API from the Next.js server (no CORS; the API URL stays server-side). */
export async function sendMessage(form: ContactForm): Promise<SendMessageResult> {
  if (form.website) return { ok: false, error: "invalid" };
  if (!TOPICS.includes(form.topic)) return { ok: false, error: "invalid" };

  const body: ContactMessageCreate = {
    locale: form.locale,
    topic: form.topic,
    name: form.name,
    phone: form.phone || null,
    email: form.email || null,
    company: form.company || null,
    city: form.city || null,
    message: form.message,
  };

  try {
    const sent = await apiRequest<ContactMessageCreated>("/api/v1/contact-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return { ok: true, reference: sent.reference };
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) return { ok: false, error: "invalid" };
    console.error("Contact message could not be sent", error);
    return { ok: false, error: "unavailable" };
  }
}
