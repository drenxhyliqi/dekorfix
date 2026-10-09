import type { Metadata } from "next";

import { IntroLoader } from "@/components/layout/intro-loader";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SocialRail } from "@/components/layout/social-rail";
import { env } from "@/config/env";
import { routes } from "@/config/routes";
import { company } from "@/config/site";
import { Assistant } from "@/features/assistant/assistant";
import { CartProvider } from "@/features/shop/cart-context";
import { shopProducts } from "@/features/shop/shop-products";
import { localizePath, locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { geist } from "@/lib/fonts";

import "../globals.css";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    metadataBase: new URL(env.siteUrl),
    title: { default: t.meta.title, template: `%s · ${t.meta.title}` },
    description: t.meta.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);
  const shopLinks = {
    products: href(routes.products),
    cart: href(routes.cart),
    checkout: href(routes.checkout),
    terms: href(routes.terms),
    privacy: href(routes.privacy),
  };

  return (
    // The intro's pre-paint script may add data-intro-skip to <html> before hydration.
    <html lang={locale} className={geist.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <IntroLoader />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-inverse focus:px-4 focus:py-3 focus:text-small focus:font-medium focus:text-inverse-text"
        >
          {t.a11y.skipToContent}
        </a>
        <CartProvider locale={locale} copy={t.shop} links={shopLinks} products={shopProducts(t, locale)}>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <SiteFooter />
        </CartProvider>
        <SocialRail labels={t.header} />
        {/* Shown only when the server has an OpenAI key (see app/api/assistant). */}
        {Boolean(process.env.OPEN_AI_KEY ?? process.env.OPENAI_API_KEY) && (
          <Assistant locale={locale} copy={t.assistant} contact={{ phone: company.phones[0].display, email: company.email }} />
        )}
      </body>
    </html>
  );
}
