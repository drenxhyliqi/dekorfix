import { ArrowRight } from "lucide-react";

import { CategoryCard } from "@/components/cards/category-card";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { productCategories, type ProductCategoryKey } from "@/config/navigation";
import { routes } from "@/config/routes";
import { getProduct } from "@/content/products";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** One recognisable packshot per category. */
const CATEGORY_IMAGE: Record<ProductCategoryKey, string> = {
  adhesives: "styrofix",
  facades: "fasader",
  bases: "baza",
  paints: "premium",
  plasters: "confix",
};

export function ProductRange({ t, locale }: { t: Dictionary; locale: Locale }) {
  const copy = t.home.range;
  return (
    <Section aria-labelledby="range-title">
      <SectionHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        titleId="range-title"
        description={copy.description}
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
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-5">
        {productCategories.map((category, index) => {
          const product = getProduct(CATEGORY_IMAGE[category.key]);
          const name = t.productCategories[category.key].name;
          return (
            <CategoryCard
              key={category.key}
              index={String(index + 1).padStart(2, "0")}
              name={name}
              description={t.productCategories[category.key].description}
              href={localizePath(locale, category.path)}
              image={product && { src: product.image, alt: `${product.name}, ${name}` }}
            />
          );
        })}
      </div>
    </Section>
  );
}
