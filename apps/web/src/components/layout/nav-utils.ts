/** True for the link's own page and anything below it (e.g. /products and /products/[slug]). */
export function isActivePath(pathname: string, href: string, exact = false): boolean {
  const path = href.split("?")[0] ?? href;
  return pathname === path || (!exact && pathname.startsWith(`${path}/`));
}
