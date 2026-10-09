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
  finder: "/product-finder",
  /** The product finder, opened on a job (see features/finder/model.ts). */
  finderJob: (job: string) => `/product-finder?job=${job}`,
  projects: "/projects",
  project: (slug: string) => `/projects/${slug}`,
  projectStudio: "/project-studio",
  calculator: "/calculator",
  export: "/export",
  about: "/about",
  contact: "/contact",
  /** The contact page's message form, optionally with a topic chosen. */
  contactForm: (topic?: string) => (topic ? `/contact?topic=${topic}#message` : "/contact#message"),
  search: "/search",
  cart: "/cart",
  checkout: "/checkout",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
} as const;

export const adminRoutes = {
  dashboard: "/admin",
  login: "/admin/login",
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
  orders: "/admin/orders",
  quotes: "/admin/quotes",
  contacts: "/admin/contacts",
  users: "/admin/users",
  settings: "/admin/settings",
} as const;
