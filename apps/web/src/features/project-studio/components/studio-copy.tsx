"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

import type { FacadeId } from "../model/types";

interface StudioCopy {
  t: Dictionary["studio"];
  locale: Locale;
  /** "5.00" / "5,00" */
  num: (value: number, digits?: number) => string;
  /** "Front", "Right side"… */
  facadeName: (id: FacadeId) => string;
  /** "Ground floor", "Floor 1"… */
  floorName: (floor: number) => string;
}

const CopyContext = createContext<StudioCopy | null>(null);

export function StudioCopyProvider({
  t,
  locale,
  children,
}: {
  t: Dictionary["studio"];
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo<StudioCopy>(() => {
    const formatters = new Map<number, Intl.NumberFormat>();
    const num = (value: number, digits = 2) => {
      let formatter = formatters.get(digits);
      if (!formatter) {
        formatter = new Intl.NumberFormat(locale === "sq" ? "sq-AL" : "en-GB", {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        });
        formatters.set(digits, formatter);
      }
      return formatter.format(value);
    };
    const facadeName = (id: FacadeId) => t.facades.names[id];
    const floorName = (floor: number) => (floor === 0 ? t.floors.ground : `${t.floors.floor} ${floor}`);
    return { t, locale, num, facadeName, floorName };
  }, [t, locale]);

  return <CopyContext.Provider value={value}>{children}</CopyContext.Provider>;
}

export function useCopy(): StudioCopy {
  const context = useContext(CopyContext);
  if (!context) throw new Error("useCopy must be used inside <StudioCopyProvider>.");
  return context;
}
