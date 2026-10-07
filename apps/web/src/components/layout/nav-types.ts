import type { SocialNetwork } from "@/components/brand/social-icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

export interface NavLinkItem {
  key: string;
  label: string;
  href: string;
}

export interface NavMenuItem extends NavLinkItem {
  description?: string;
}

export type NavMenuKey = "products" | "solutions";

export interface NavMenu {
  heading: string;
  items: NavMenuItem[];
  all: NavLinkItem;
  /** Feature teaser shown beside the links. */
  promo: {
    eyebrow: string;
    title: string;
    text: string;
    cta: string;
    href: string;
    badge?: string;
  };
}

/** Serializable navigation model built on the server and passed to client UI. */
export interface NavModel {
  locale: Locale;
  homeHref: string;
  primary: Array<NavLinkItem & { menu?: NavMenuKey; accent?: boolean; exact?: boolean }>;
  menus: Record<NavMenuKey, NavMenu>;
  contactHref: string;
  requestQuoteHref: string;
  searchHref: string;
  loginHref: string;
  contact: {
    phone: { display: string; href: string };
    email: string;
    /** Street and city on one line. */
    address: string;
    mapsHref: string;
    social: ReadonlyArray<SocialLink>;
  };
  labels: {
    nav: Dictionary["nav"];
    a11y: Dictionary["a11y"];
    header: Dictionary["header"];
  };
}

export interface SocialLink {
  key: SocialNetwork;
  label: string;
  href: string;
}
