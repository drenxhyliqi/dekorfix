import { Geist } from "next/font/google";

/**
 * Geist: a single variable sans-serif family (100–900) with full Latin
 * Extended coverage for Albanian (ë, ç). See README → Design system.
 */
export const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist",
  display: "swap",
});
