import { ArrowRight } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { legalNav, productCategories } from "@/config/navigation";
import { routes } from "@/config/routes";
import { company } from "@/config/site";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

import { LanguageSwitcher } from "./language-switcher";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export async function SiteFooter() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const href = (path: string) => localizePath(locale, path);

  const exploreLinks = [
    { label: t.nav.solutions, path: routes.solutions },
    { label: t.nav.projects, path: routes.projects },
    { label: t.nav.projectStudio, path: routes.projectStudio },
    { label: t.nav.calculator, path: routes.calculator },
    { label: t.nav.resources, path: routes.resources },
    { label: t.nav.about, path: routes.about },
    { label: t.nav.contact, path: routes.contact },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="container-page pb-10 pt-section-sm">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-start lg:col-span-4">
            <Link href={href(routes.home)} aria-label={t.a11y.home} className="rounded-xs">
              <Logo className="w-40" />
            </Link>
            <p className="mt-8 max-w-sm text-small text-text-secondary">{t.footer.description}</p>
            <ButtonLink
              href={href(routes.requestQuote)}
              variant="secondary"
              className="mt-10"
              trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
            >
              {t.nav.requestQuote}
            </ButtonLink>
          </div>

          <nav
            aria-label={t.a11y.footerNavigation}
            className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-12"
          >
            <FooterColumn title={t.footer.products} className="lg:col-span-4 lg:col-start-2">
              {productCategories.map((category) => (
                <FooterLink key={category.key} href={href(category.path)}>
                  {t.productCategories[category.key].name}
                </FooterLink>
              ))}
              <FooterLink href={href(routes.products)} strong>
                {t.megaMenu.allProducts}
              </FooterLink>
            </FooterColumn>
            <FooterColumn title={t.footer.explore} className="lg:col-span-3">
              {exploreLinks.map((link) => (
                <FooterLink key={link.path} href={href(link.path)}>
                  {link.label}
                </FooterLink>
              ))}
            </FooterColumn>
            <FooterColumn title={t.footer.contact} className="col-span-2 sm:col-span-1 lg:col-span-4">
              <li>
                <address className="not-italic text-small leading-relaxed text-text-secondary">
                  {company.legalName}
                  <br />
                  {t.address.street}
                  <br />
                  {t.address.city}
                  <br />
                  {t.address.country}
                </address>
              </li>
              {company.phones.map((phone) => (
                <FooterLink key={phone.href} href={phone.href} className="tabular-nums">
                  {phone.display}
                </FooterLink>
              ))}
              <FooterLink href={`mailto:${company.email}`}>{company.email}</FooterLink>
            </FooterColumn>
          </nav>
        </div>

        <div className="mt-section-sm flex flex-col gap-6 border-t border-border pt-8 text-small text-text-tertiary lg:flex-row lg:items-center lg:justify-between">
          <p>
            © <CurrentYear /> {company.legalName} {t.footer.rights}
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
            <nav aria-label={t.a11y.legalNavigation}>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {legalNav.map((item) => (
                  <li key={item.key}>
                    <Link href={href(item.path)} className="transition-colors duration-150 hover:text-text">
                      {t.legal[item.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {company.social.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-150 hover:text-text"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
            <LanguageSwitcher current={locale} label={t.a11y.language} />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <h2 className="mb-5 text-label uppercase text-text-tertiary">{title}</h2>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  className,
  strong,
  children,
}: {
  href: string;
  className?: string;
  strong?: boolean;
  children: ReactNode;
}) {
  const classes = `text-small transition-colors duration-150 hover:text-text ${
    strong ? "font-medium text-text" : "text-text-secondary"
  } ${className ?? ""}`;
  return (
    <li>
      {href.startsWith("/") ? (
        <Link href={href} className={classes}>
          {children}
        </Link>
      ) : (
        <a href={href} className={classes}>
          {children}
        </a>
      )}
    </li>
  );
}
