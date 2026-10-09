import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const suggestions = [
    { label: t.nav.products, path: routes.products },
    { label: t.nav.finder, path: routes.finder },
    { label: t.nav.projectStudio, path: routes.projectStudio },
    { label: t.nav.contact, path: routes.contact },
  ];

  return (
    <Container className="grid gap-16 py-section lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-7">
        <Eyebrow className="mb-6">{t.notFound.eyebrow}</Eyebrow>
        <Heading as="h1" size="h1">
          {t.notFound.title}
        </Heading>
        <Text size="lead" className="mt-6 max-w-xl">
          {t.notFound.description}
        </Text>
        <ButtonLink
          href={localizePath(locale, routes.home)}
          variant="secondary"
          className="mt-10"
          leadingIcon={<ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />}
        >
          {t.notFound.back}
        </ButtonLink>
      </div>
      <nav aria-labelledby="not-found-suggestions" className="lg:col-span-4 lg:col-start-9 lg:self-end">
        <h2 id="not-found-suggestions" className="mb-4 text-label uppercase text-text-tertiary">
          {t.notFound.suggestions}
        </h2>
        <ul className="border-t border-border">
          {suggestions.map((item) => (
            <li key={item.path} className="border-b border-border">
              <Link
                href={localizePath(locale, item.path)}
                className="group flex items-center justify-between py-4 text-h4 text-text"
              >
                {item.label}
                <ArrowRight
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-5 transition-transform duration-250 group-hover:translate-x-1"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  );
}
