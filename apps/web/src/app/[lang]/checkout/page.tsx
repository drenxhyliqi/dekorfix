import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { routes } from "@/config/routes";
import { CheckoutView } from "@/features/shop/checkout-view";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  const metadata = await pageMetadata({
    title: t.pages.checkout.title,
    description: t.pages.checkout.description,
    path: routes.checkout,
  });
  return { ...metadata, robots: { index: false, follow: false } };
}

export default async function CheckoutPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);

  return (
    <div className="container-page pb-section pt-10 md:pt-14">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: href(routes.home) },
          { label: t.shop.cart.title, href: href(routes.cart) },
          { label: t.shop.checkout.eyebrow },
        ]}
        label={t.a11y.breadcrumbs}
      />
      <CheckoutView />
    </div>
  );
}
