import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/cards/product-card";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { routes } from "@/config/routes";
import { getProducts } from "@/content/products";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

const FEATURED = ["styrofiber", "thermofix", "niveler", "beton-kontakt"];

export function FeaturedProducts({ t, locale }: { t: Dictionary; locale: Locale }) {
  const copy = t.home.featured;
  return (
    <Section aria-labelledby="featured-title">
      <SectionHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        titleId="featured-title"
        action={
          <ButtonLink
            href={localizePath(locale, routes.products)}
            variant="secondary"
            trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
          >
            {copy.action}
          </ButtonLink>
        }
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {getProducts(FEATURED).map((product) => (
          <ProductCard
            key={product.slug}
            name={product.name}
            category={t.productCategories[product.category].name}
            description={product.summary[locale]}
            href={localizePath(locale, routes.product(product.slug))}
            image={{ src: product.image, alt: product.name }}
          />
        ))}
      </div>
    </Section>
  );
}
