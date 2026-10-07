import { notFound } from "next/navigation";

// This segment always 404s, so there is nothing to validate for instant navigation.
export const instant = false;

/** Routes that don't exist yet render the localized not-found page inside the site shell. */
export default function MissingPage() {
  notFound();
}
