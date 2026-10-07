/**
 * Company facts used across the site. Sources: dekorfix.net (address, phones,
 * ISO 9001) and dekorfix.netlify.app (email, social accounts).
 * Localised address lines live in the dictionaries.
 */
export const company = {
  name: "Dekorfix",
  legalName: "Dekorfix sh.p.k.",
  phones: [
    { display: "+383 44 216 541", href: "tel:+38344216541" },
    { display: "+383 49 216 541", href: "tel:+38349216541" },
  ],
  email: "info@dekorfix.net",
  social: [
    { label: "Facebook", href: "https://www.facebook.com/dekorfixks" },
    { label: "Instagram", href: "https://www.instagram.com/dekorfix_sh.p.k/" },
  ],
} as const;
