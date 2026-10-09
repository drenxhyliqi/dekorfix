import {
  Building2,
  Calculator,
  FileText,
  Inbox,
  Layers,
  LayoutDashboard,
  Mail,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

import { adminRoutes } from "./routes";

export type AdminSectionKey =
  | "dashboard"
  | "products"
  | "categories"
  | "solutions"
  | "projects"
  | "resources"
  | "calculator"
  | "orders"
  | "quotes"
  | "contacts"
  | "users"
  | "settings";

export interface AdminSection {
  key: AdminSectionKey;
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  /** The noun on a detail page's title, e.g. "produktin" (Ndrysho produktin). */
  item?: string;
}

/** Admin sidebar, grouped. The admin UI is in Albanian. */
export const adminNavigation: ReadonlyArray<{ group: string; sections: AdminSection[] }> = [
  {
    group: "Përmbledhje",
    sections: [
      {
        key: "dashboard",
        label: "Paneli",
        href: adminRoutes.dashboard,
        icon: LayoutDashboard,
        description: "Përmbledhje e përmbajtjes, kërkesave dhe gjendjes së sistemit.",
      },
    ],
  },
  {
    group: "Katalogu dhe përmbajtja",
    sections: [
      {
        key: "products",
        label: "Produktet",
        href: adminRoutes.products,
        icon: Package,
        description: "Produktet, të dhënat teknike, paketimi dhe dokumentet.",
        item: "produktin",
      },
      {
        key: "categories",
        label: "Kategoritë",
        href: adminRoutes.categories,
        icon: Tags,
        description: "Kategoritë e produkteve dhe renditja e tyre.",
      },
      {
        key: "solutions",
        label: "Zgjidhjet",
        href: adminRoutes.solutions,
        icon: Layers,
        description: "Sistemet e ndërtimit dhe produktet që përdorin.",
        item: "zgjidhjen",
      },
      {
        key: "projects",
        label: "Projektet",
        href: adminRoutes.projects,
        icon: Building2,
        description: "Projektet referuese dhe fotografitë e tyre.",
        item: "projektin",
      },
      {
        key: "resources",
        label: "Dokumentet",
        href: adminRoutes.resources,
        icon: FileText,
        description: "Fletët teknike, katalogët, certifikatat dhe udhëzuesit.",
        item: "dokumentin",
      },
    ],
  },
  {
    group: "Mjetet",
    sections: [
      {
        key: "calculator",
        label: "Kalkulatori",
        href: adminRoutes.calculator,
        icon: Calculator,
        description: "Rregullat e shpenzimit dhe vlerat e mbulimit që përdor kalkulatori.",
      },
    ],
  },
  {
    group: "Kërkesat",
    sections: [
      {
        key: "orders",
        label: "Porositë",
        href: adminRoutes.orders,
        icon: ShoppingBag,
        description: "Porositë nga shitorja e faqes, për t'u konfirmuar me secilin klient.",
      },
      {
        key: "quotes",
        label: "Ofertat",
        href: adminRoutes.quotes,
        icon: Inbox,
        description: "Kërkesat për ofertë të dërguara nga faqja.",
      },
      {
        key: "contacts",
        label: "Mesazhet",
        href: adminRoutes.contacts,
        icon: Mail,
        description: "Mesazhet e dërguara nga formulari i kontaktit.",
      },
    ],
  },
  {
    group: "Sistemi",
    sections: [
      {
        key: "users",
        label: "Përdoruesit",
        href: adminRoutes.users,
        icon: Users,
        description: "Llogaritë e administratorëve dhe rolet.",
      },
      {
        key: "settings",
        label: "Cilësimet",
        href: adminRoutes.settings,
        icon: Settings,
        description: "Të dhënat e kompanisë, gjuhët dhe cilësimet e faqes.",
      },
    ],
  },
];

export const adminSections: Record<AdminSectionKey, AdminSection> = Object.fromEntries(
  adminNavigation.flatMap((group) => group.sections).map((section) => [section.key, section]),
) as Record<AdminSectionKey, AdminSection>;

/** The section a pathname belongs to (longest matching prefix; the dashboard only matches exactly). */
export function findAdminSection(pathname: string): AdminSection | undefined {
  return Object.values(adminSections)
    .filter((s) =>
      s.key === "dashboard" ? pathname === s.href : pathname === s.href || pathname.startsWith(`${s.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
}
