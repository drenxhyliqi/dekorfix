/**
 * Every app path in one place. Public paths are locale-independent; prefix
 * them with `localizePath(locale, path)`. Admin paths are not localized.
 */

export const routes = {
  home: "/",
  products: "/products",
  product: (slug: string) => `/products/${slug}`,
  /** Category filter on the catalog; keeps /products/[slug] free for products. */
  productCategory: (category: string) => `/products?category=${category}`,
  solutions: "/solutions",
  solution: (slug: string) => `/solutions/${slug}`,
  projects: "/projects",
  project: (slug: string) => `/projects/${slug}`,
  projectStudio: "/project-studio",
  calculator: "/calculator",
  resources: "/resources",
  resource: (slug: string) => `/resources/${slug}`,
  about: "/about",
  contact: "/contact",
  requestQuote: "/request-quote",
  search: "/search",
  login: "/login",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
} as const;

export const adminRoutes = {
  dashboard: "/admin",
  products: "/admin/products",
  product: (id: string) => `/admin/products/${id}`,
  categories: "/admin/categories",
  solutions: "/admin/solutions",
  solution: (id: string) => `/admin/solutions/${id}`,
  projects: "/admin/projects",
  project: (id: string) => `/admin/projects/${id}`,
  resources: "/admin/resources",
  resource: (id: string) => `/admin/resources/${id}`,
  calculator: "/admin/calculator",
  quotes: "/admin/quotes",
  contacts: "/admin/contacts",
  users: "/admin/users",
  settings: "/admin/settings",
} as const;
