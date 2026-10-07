import { productCategories, primaryNav, solutionAreas } from "@/config/navigation";
import { routes } from "@/config/routes";
import { company } from "@/config/site";
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
        items: productCategories.map((category) => ({
          key: category.key,
          label: t.productCategories[category.key].name,
          description: t.productCategories[category.key].description,
          href: href(category.path),
        })),
        all: { key: "all", label: m.allProducts, href: href(routes.products) },
        promo: {
          eyebrow: m.studioEyebrow,
          title: m.studioTitle,
          text: m.studioText,
          cta: m.studioCta,
          href: href(routes.projectStudio),
          badge: m.comingSoon,
        },
      },
      solutions: {
        heading: m.solutionAreas,
        items: solutionAreas.map((area) => ({
          key: area.key,
          label: t.solutionAreas[area.key],
          href: href(area.path),
        })),
        all: { key: "all", label: m.allSolutions, href: href(routes.solutions) },
        promo: {
          eyebrow: m.calculatorEyebrow,
          title: m.calculatorTitle,
          text: m.calculatorText,
          cta: m.calculatorCta,
          href: href(routes.calculator),
          badge: m.comingSoon,
        },
      },
    },
    contactHref: href(routes.contact),
    requestQuoteHref: href(routes.requestQuote),
    phone: company.phones[0],
    labels: { nav: t.nav, a11y: t.a11y },
  };

  return <SiteNavbar model={model} />;
}
