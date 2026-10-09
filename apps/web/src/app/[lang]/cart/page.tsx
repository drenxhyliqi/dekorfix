import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { routes } from "@/config/routes";
import { CartView } from "@/features/shop/cart-view";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  const metadata = await pageMetadata({ title: t.pages.cart.title, description: t.pages.cart.description, path: routes.cart });
  return { ...metadata, robots: { index: false, follow: true } };
}

/** The cart lives in the browser, so the page renders it on the client. */
export default async function CartPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);

  return (
    <div className="container-page pb-section pt-10 md:pt-14">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: href(routes.home) },
          { label: t.nav.products, href: href(routes.products) },
          { label: t.shop.cart.title },
        ]}
        label={t.a11y.breadcrumbs}
      />
      <h1 className="mb-10 mt-8 text-[clamp(2.5rem,1.5rem+4vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-text md:mb-14 md:mt-12">
        {t.shop.cart.title}
      </h1>
      <CartView />
    </div>
  );
}
