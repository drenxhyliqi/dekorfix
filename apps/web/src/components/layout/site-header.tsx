import { finderJobs, productCategories, primaryNav } from "@/config/navigation";
import { adminRoutes, routes } from "@/config/routes";
import { company } from "@/config/site";
import { getProduct, products } from "@/content/products";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

import type { NavModel } from "./nav-types";
import { SiteNavbar } from "./navbar";

export async function SiteHeader() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const m = t.megaMenu;

  const model: NavModel = {
    locale,
    homeHref: href(routes.home),
    primary: primaryNav.map((item) => ({
      key: item.key,
      label: t.nav[item.key],
      href: href(item.path),
      menu: item.menu,
      exact: item.exact,
      accent: item.key === "projectStudio",
    })),
    menus: {
      products: {
        heading: m.categories,
        intro: m.productsIntro,
        items: productCategories.map((category) => ({
          key: category.key,
          label: t.productCategories[category.key].name,
          description: t.productCategories[category.key].description,
          href: href(category.path),
          image: products.find((product) => product.category === category.key)?.image,
        })),
        all: { key: "all", label: m.allProducts, href: href(routes.products) },
      },
      finder: {
        heading: m.finderHeading,
        intro: m.finderIntro,
        items: finderJobs.map((job) => ({
          key: job.key,
          label: t.finder.jobs[job.key].title,
          description: t.finder.jobs[job.key].text,
          href: href(job.path),
          image: getProduct(t.finder.jobs[job.key].image)?.image,
        })),
        all: { key: "all", label: m.finderAll, href: href(routes.finder) },
      },
    },
    contactHref: href(routes.contact),
    talkHref: href(routes.contactForm()),
    searchHref: href(routes.search),
    // The account icon opens the admin sign-in (not localized).
    loginHref: adminRoutes.login,
    contact: {
      phone: company.phones[0],
      email: company.email,
      address: `${t.address.street}, ${t.address.city}`,
      mapsHref: company.mapsHref,
      social: company.social,
    },
    labels: { nav: t.nav, a11y: t.a11y, header: t.header },
  };

  return <SiteNavbar model={model} />;
}
