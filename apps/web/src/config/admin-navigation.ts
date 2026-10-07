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
  /** Singular noun for detail pages, e.g. "product". */
  item?: string;
}

/** Admin sidebar, grouped. The admin UI is English-only for now. */
export const adminNavigation: ReadonlyArray<{ group: string; sections: AdminSection[] }> = [
  {
    group: "Overview",
    sections: [
      {
        key: "dashboard",
        label: "Dashboard",
        href: adminRoutes.dashboard,
        icon: LayoutDashboard,
        description: "Overview of content, requests and system status.",
      },
    ],
  },
  {
    group: "Catalogue & content",
    sections: [
      {
        key: "products",
        label: "Products",
        href: adminRoutes.products,
        icon: Package,
        description: "Products, technical data, packaging and documents.",
        item: "product",
      },
      {
        key: "categories",
        label: "Categories",
        href: adminRoutes.categories,
        icon: Tags,
        description: "Product categories and their order.",
      },
      {
        key: "solutions",
        label: "Solutions",
        href: adminRoutes.solutions,
        icon: Layers,
        description: "Construction systems and the products they use.",
        item: "solution",
      },
      {
        key: "projects",
        label: "Projects",
        href: adminRoutes.projects,
        icon: Building2,
        description: "Reference projects and their photography.",
        item: "project",
      },
      {
        key: "resources",
        label: "Resources",
        href: adminRoutes.resources,
        icon: FileText,
        description: "Data sheets, catalogues, certificates and guides.",
        item: "resource",
      },
    ],
  },
  {
    group: "Tools",
    sections: [
      {
        key: "calculator",
        label: "Calculator",
        href: adminRoutes.calculator,
        icon: Calculator,
        description: "Consumption rules and coverage values used by the calculator.",
      },
    ],
  },
  {
    group: "Requests",
    sections: [
      {
        key: "quotes",
        label: "Quotes",
        href: adminRoutes.quotes,
        icon: Inbox,
        description: "Quote requests submitted from the website.",
      },
      {
        key: "contacts",
        label: "Contacts",
        href: adminRoutes.contacts,
        icon: Mail,
        description: "Messages sent through the contact form.",
      },
    ],
  },
  {
    group: "System",
    sections: [
      {
        key: "users",
        label: "Users",
        href: adminRoutes.users,
        icon: Users,
        description: "Administrator accounts and roles.",
      },
      {
        key: "settings",
        label: "Settings",
        href: adminRoutes.settings,
        icon: Settings,
        description: "Company details, languages and site settings.",
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
