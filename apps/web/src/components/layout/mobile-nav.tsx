"use client";

import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone, Plus, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { DialogCloseButton, Drawer } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { LanguageLinks } from "./language-switcher";
import type { NavMenu, NavMenuKey, NavModel } from "./nav-types";
import { isActivePath } from "./nav-utils";
import { SocialLinks } from "./social-links";

/*
 * Links rise in one after another each time the drawer opens (@starting-style
 * applies whenever the <dialog> becomes visible). Reduced motion drops the stagger.
 */
const reveal =
  "transition-[opacity,translate] duration-500 ease-out delay-(--stagger) motion-reduce:delay-0 starting:translate-y-3 starting:opacity-0";

const stagger = (index: number) => ({ "--stagger": `${80 + index * 40}ms` }) as CSSProperties;

/** Full-height navigation sheet for mobile, tablet and small laptops. */
export function MobileNav({
  model,
  open,
  onOpenChange,
  pathname,
}: {
  model: NavModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string | null;
}) {
  const [expanded, setExpanded] = useState<NavMenuKey | null>(null);
  const { nav, a11y, header } = model.labels;
  const { contact } = model;
  const close = () => onOpenChange(false);

  const links = [
    ...model.primary,
    { key: "contact", label: nav.contact, href: model.contactHref },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} label={nav.menu} width="lg" className="xl:hidden">
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/90 px-gutter backdrop-blur-xl">
          <Link href={model.homeHref} aria-label={a11y.home} onClick={close} className="-m-1 rounded-xs p-1">
            <Logo className="w-26 sm:w-28" />
          </Link>
          <DialogCloseButton autoFocus label={a11y.closeMenu} onClick={close} />
        </div>

        <nav aria-label={a11y.mainNavigation} className="px-gutter pb-12 pt-2">
          <ul>
            {links.map((item, index) => {
              const number = (
                <span className="w-9 shrink-0 self-start pt-2 text-caption tabular-nums text-text-tertiary">
                  {String(index + 1).padStart(2, "0")}
                </span>
              );
              const menuKey = "menu" in item ? item.menu : undefined;
              if (menuKey) {
                const isOpen = expanded === menuKey;
                return (
                  <li key={item.key} className={cn("border-b border-border", reveal)} style={stagger(index)}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`mobile-${menuKey}`}
                      onClick={() => setExpanded(isOpen ? null : menuKey)}
                      className="flex w-full items-center py-4 text-left text-h3 text-text"
                    >
                      {number}
                      <span className="flex-1">{item.label}</span>
                      <span
                        aria-hidden
                        className={cn(
                          "inline-flex size-9 items-center justify-center rounded-full border transition-colors duration-250",
                          isOpen ? "border-brand bg-brand text-white" : "border-border text-text",
                        )}
                      >
                        <Plus
                          strokeWidth={1.75}
                          className={cn("size-4 transition-transform duration-250", isOpen && "rotate-45")}
                        />
                      </span>
                    </button>
                    <Collapsible id={`mobile-${menuKey}`} open={isOpen}>
                      <SubMenu menu={model.menus[menuKey]} />
                    </Collapsible>
                  </li>
                );
              }
              const active = pathname !== null && isActivePath(pathname, item.href, "exact" in item && item.exact);
              const accent = "accent" in item && item.accent;
              return (
                <li key={item.key} className={cn("border-b border-border", reveal)} style={stagger(index)}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn("group/link flex items-center py-4 text-h3", active ? "text-brand-text" : "text-text")}
                  >
                    {number}
                    <span className="flex flex-1 items-center gap-3">
                      {item.label}
                      {accent && <span aria-hidden className="brand-mark" />}
                    </span>
                    {active ? (
                      <span aria-hidden className="h-6 w-0.5 bg-brand" />
                    ) : (
                      <ArrowRight
                        aria-hidden
                        strokeWidth={1.5}
                        className="size-5 text-text-tertiary transition-[color,translate] duration-250 group-hover/link:translate-x-1 group-hover/link:text-text"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={cn(
            "mt-auto border-t border-border px-gutter pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
            reveal,
          )}
          style={stagger(links.length)}
        >
          <p className="flex items-center gap-2.5 text-label uppercase text-text-tertiary">
            <span aria-hidden className="brand-mark" />
            {header.getInTouch}
          </p>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            <ContactRow icon={Phone} label={header.call} href={contact.phone.href} valueClassName="tabular-nums">
              {contact.phone.display}
            </ContactRow>
            <ContactRow icon={Mail} label={header.email} href={`mailto:${contact.email}`}>
              {contact.email}
            </ContactRow>
            <ContactRow icon={MapPin} label={header.visit} href={contact.mapsHref} newTabLabel={a11y.newTab}>
              {contact.address}
            </ContactRow>
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div className="flex items-center gap-4">
              <span className="text-small text-text-secondary">{header.follow}</span>
              <SocialLinks links={contact.social} newTabLabel={a11y.newTab} variant="outline" />
            </div>
            <LanguageLinks current={model.locale} label={a11y.language} pathname={pathname} />
          </div>

          <ButtonLink
            href={model.requestQuoteHref}
            variant="accent"
            size="lg"
            className="mt-8 w-full"
            trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
          >
            {nav.requestQuote}
          </ButtonLink>
        </div>
      </div>
    </Drawer>
  );
}

function ContactRow({
  icon: Icon,
  label,
  href,
  newTabLabel,
  valueClassName,
  children,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  /** Set for links that open in a new tab. */
  newTabLabel?: string;
  valueClassName?: string;
  children: ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        {...(newTabLabel ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group/row flex items-center gap-4 py-4"
      >
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-strong text-brand transition-colors duration-250 group-hover/row:bg-brand group-hover/row:text-white">
          <Icon aria-hidden className="size-[1.125rem]" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-caption text-text-tertiary">{label}</span>
          <span className={cn("block text-body text-text [overflow-wrap:anywhere]", valueClassName)}>{children}</span>
        </span>
        <ArrowUpRight
          aria-hidden
          strokeWidth={1.5}
          className="size-4 shrink-0 text-text-tertiary transition-[color,translate] duration-250 group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-text"
        />
        {newTabLabel && <span className="sr-only"> ({newTabLabel})</span>}
      </a>
    </li>
  );
}

function Collapsible({ id, open, children }: { id: string; open: boolean; children: ReactNode }) {
  return (
    <div
      id={id}
      className={cn(
        "grid transition-[grid-template-rows] duration-350 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="overflow-hidden" inert={!open}>
        {children}
      </div>
    </div>
  );
}

function SubMenu({ menu }: { menu: NavMenu }) {
  return (
    <ul className="mb-5 ml-9 border-l border-border pl-5">
      {menu.items.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            className="block py-2 text-lead text-text-secondary transition-colors hover:text-text"
          >
            {item.label}
          </Link>
        </li>
      ))}
      <li className="pt-2">
        <Link href={menu.all.href} className="inline-flex items-center gap-2 text-small font-medium text-brand-text">
          {menu.all.label}
          <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
        </Link>
      </li>
    </ul>
  );
}
