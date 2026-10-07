"use client";

import { ArrowRight, Phone, Plus } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { DialogCloseButton, Drawer } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { LanguageLinks } from "./language-switcher";
import type { NavMenu, NavMenuKey, NavModel } from "./nav-types";
import { isActivePath } from "./nav-utils";

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
  const { nav, a11y } = model.labels;
  const close = () => onOpenChange(false);

  const links = [
    ...model.primary,
    { key: "contact", label: nav.contact, href: model.contactHref },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} label={nav.menu} width="lg" className="xl:hidden">
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-header-compact shrink-0 items-center justify-between border-b border-border bg-background px-gutter">
          <Link href={model.homeHref} aria-label={a11y.home} onClick={close}>
            <Logo className="w-28" />
          </Link>
          <DialogCloseButton autoFocus label={a11y.closeMenu} onClick={close} />
        </div>

        <nav aria-label={a11y.mainNavigation} className="px-gutter pt-4">
          <ul>
            {links.map((item, index) => {
              const number = (
                <span className="w-8 shrink-0 text-small tabular-nums text-text-tertiary">
                  {String(index + 1).padStart(2, "0")}
                </span>
              );
              const menuKey = "menu" in item ? item.menu : undefined;
              if (menuKey) {
                const isOpen = expanded === menuKey;
                return (
                  <li key={item.key} className="border-b border-border">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`mobile-${menuKey}`}
                      onClick={() => setExpanded(isOpen ? null : menuKey)}
                      className="flex w-full items-center py-4 text-left text-h3 text-text"
                    >
                      {number}
                      <span className="flex-1">{item.label}</span>
                      <Plus
                        aria-hidden
                        strokeWidth={1.5}
                        className={cn("size-5 transition-transform duration-250", isOpen && "rotate-45")}
                      />
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
                <li key={item.key} className="border-b border-border">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="flex items-center py-4 text-h3 text-text"
                  >
                    {number}
                    <span className="flex flex-1 items-center gap-3">
                      {item.label}
                      {accent && <span aria-hidden className="brand-mark" />}
                    </span>
                    {active && <span aria-hidden className="h-6 w-0.5 bg-brand" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto space-y-6 px-gutter pb-6 pt-10">
          <ButtonLink href={model.requestQuoteHref} size="lg" className="w-full">
            {nav.requestQuote}
          </ButtonLink>
          <div className="flex items-center justify-between gap-4">
            <a
              href={model.phone.href}
              className="inline-flex items-center gap-2 text-small text-text-secondary hover:text-text"
            >
              <Phone aria-hidden className="size-4" strokeWidth={1.5} />
              {model.phone.display}
            </a>
            <LanguageLinks current={model.locale} label={a11y.language} pathname={pathname} />
          </div>
        </div>
      </div>
    </Drawer>
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
    <ul className="pb-5 pl-8">
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
        <Link href={menu.all.href} className="inline-flex items-center gap-2 text-small font-medium text-text">
          {menu.all.label}
          <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
        </Link>
      </li>
    </ul>
  );
}
