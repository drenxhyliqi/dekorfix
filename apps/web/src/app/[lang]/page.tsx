import type { Metadata } from "next";

import Timeline from "@/components/ui/timeline";
import { routes } from "@/config/routes";
import { CategoryShowcase } from "@/features/home/category-showcase";
import { ClosingCta } from "@/features/home/closing-cta";
import { FeaturedProducts } from "@/features/home/featured-products";
import { LayerSystem } from "@/features/home/layer-system";
import { Manufacturing } from "@/features/home/manufacturing";
import { ProductHero } from "@/features/home/product-hero";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({ description: t.pages.home.description, path: routes.home });
}

export default async function HomePage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const timeline = t.home.timeline;

  return (
    <>
      <ProductHero
        copy={t.home.hero}
        productsHref={localizePath(locale, routes.products)}
        quoteHref={localizePath(locale, routes.requestQuote)}
      />
      <Timeline
        title={timeline.title}
        periodLabel={timeline.period}
        items={timeline.items}
        image={{ src: "/images/photos/plant-loading.webp", alt: timeline.imageAlt }}
        duration={1.4}
      />
      <CategoryShowcase t={t} locale={locale} />
      <FeaturedProducts t={t} locale={locale} />
      <Manufacturing t={t} />
      <LayerSystem t={t} locale={locale} />
      <ClosingCta t={t} locale={locale} />
    </>
  );
}
