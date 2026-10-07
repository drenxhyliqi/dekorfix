import { notFound } from "next/navigation";

// This segment always 404s, so there is nothing to validate for instant navigation.
export const instant = false;

export default function AdminMissingPage() {
  notFound();
}
