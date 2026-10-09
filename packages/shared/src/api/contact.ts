/**
 * Contracts for the contact form's endpoint.
 * Keep these in sync with `apps/api/app/schemas/contact_message.py`.
 */

export type ContactTopic = "products" | "project" | "order" | "export" | "other";

/** `POST /api/v1/contact-messages` request body. At least one of phone and email is required. */
export interface ContactMessageCreate {
  locale: "sq" | "en";
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  city?: string | null;
  topic: ContactTopic;
  /** 10–2000 characters. */
  message: string;
}

/** `POST /api/v1/contact-messages` response (201). */
export interface ContactMessageCreated {
  reference: string;
  created_at: string;
}
