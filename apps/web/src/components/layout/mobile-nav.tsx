"use client";

import { ArrowRight, ChevronDown, Mail, MapPin, Phone, Search, type LucideIcon } from "lucide-react";
import Image from "next/image";
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
 * Rows rise in one after another each time the drawer opens (@starting-style
 * applies whenever the <dialog> becomes visible). Reduced motion drops the stagger.
 */
const reveal =
  "transition-[opacity,translate] duration-500 ease-out delay-(--stagger) motion-reduce:delay-0 starting:translate-y-2 starting:opacity-0";

const stagger = (index: number) => ({ "--stagger": `${60 + index * 35}ms` }) as CSSProperties;

/** A main row: large label on a soft highlight when pressed, hovered or current. */
const row =
  "group/row -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-sm px-3 py-3 text-left text-[1.5rem] font-medium leading-tight tracking-[-0.025em] transition-colors duration-200 active:bg-surface-strong sm:text-[1.75rem]";

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

  const links = [...model.primary, { key: "contact", label: nav.contact, href: model.contactHref }];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} label={nav.menu} width="lg" className="xl:hidden">
      {/* Focus lands on the sheet itself, so no control shows a focus ring on open;
          Tab then moves through it as usual. */}
      <div autoFocus tabIndex={-1} className="flex min-h-full flex-col outline-none">
        <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/90 px-gutter backdrop-blur-xl">
          <Link href={model.homeHref} aria-label={a11y.home} onClick={close} className="-m-1 rounded-xs p-1">
            <Logo className="w-26 sm:w-28" />
          </Link>
          <DialogCloseButton label={a11y.closeMenu} onClick={close} />
        </div>

        <div className={cn("px-gutter pt-5", reveal)} style={stagger(0)}>
          <Link
            href={model.searchHref}
            onClick={close}
            className="flex h-12 items-center gap-3 rounded-sm border border-border bg-surface-muted px-4 text-[0.9375rem] text-text-tertiary transition-colors duration-200 hover:border-border-strong active:bg-surface-strong"
          >
            <Search aria-hidden className="size-[1.125rem] shrink-0 text-text-secondary" strokeWidth={1.75} />
            <span className="truncate">{header.searchPlaceholder}</span>
            <span className="sr-only">{nav.search}</span>
          </Link>
        </div>

        <nav aria-label={a11y.mainNavigation} className="px-gutter pb-8 pt-4">
          <ul className="space-y-0.5">
            {links.map((item, index) => {
              const menuKey = "menu" in item ? item.menu : undefined;
              const active = pathname !== null && isActivePath(pathname, item.href, "exact" in item && item.exact);
              if (menuKey) {
                const isOpen = expanded === menuKey;
                return (
                  <li key={item.key} className={reveal} style={stagger(index + 1)}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`mobile-${menuKey}`}
                      onClick={() => setExpanded(isOpen ? null : menuKey)}
                      className={cn(row, "text-text", isOpen && "bg-surface-muted")}
                    >
                      <span className="flex-1">{item.label}</span>
                      {active && <ActiveDot />}
                      <ChevronDown
                        aria-hidden
                        strokeWidth={1.75}
                        className={cn(
                          "size-5 shrink-0 text-text-tertiary transition-transform duration-300 ease-out",
                          isOpen && "rotate-180 text-text",
                        )}
                      />
                    </button>
                    <Collapsible id={`mobile-${menuKey}`} open={isOpen}>
                      <SubMenu menu={model.menus[menuKey]} onNavigate={close} />
                    </Collapsible>
                  </li>
                );
              }
              const accent = "accent" in item && item.accent;
              return (
                <li key={item.key} className={reveal} style={stagger(index + 1)}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={close}
                    className={cn(row, active ? "bg-surface-muted text-text" : "text-text hover:bg-surface-muted")}
                  >
                    <span className="flex flex-1 items-center gap-2.5">
                      {item.label}
                      {accent && <span aria-hidden className="brand-mark" />}
                    </span>
                    {active && <ActiveDot />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={cn("mt-auto px-gutter pb-[max(1.25rem,env(safe-area-inset-bottom))]", reveal)}
          style={stagger(links.length + 1)}
        >
          <p className="text-label uppercase text-text-tertiary">{header.getInTouch}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <QuickAction icon={Phone} label={header.call} href={contact.phone.href} />
            <QuickAction icon={Mail} label={header.email} href={`mailto:${contact.email}`} />
            <QuickAction icon={MapPin} label={header.visit} href={contact.mapsHref} newTabLabel={a11y.newTab} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <SocialLinks links={contact.social} newTabLabel={a11y.newTab} variant="outline" />
            <LanguageLinks current={model.locale} label={a11y.language} pathname={pathname} />
          </div>

          <ButtonLink
            href={model.talkHref}
            variant="accent"
            size="lg"
            className="mt-5 w-full"
            trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
          >
            {nav.talk}
          </ButtonLink>
        </div>
      </div>
    </Drawer>
  );
}

function ActiveDot() {
  return <span aria-hidden className="size-1.5 shrink-0 rounded-[1px] bg-brand" />;
}

/** Call, email or map: an icon over a short label. */
function QuickAction({
  icon: Icon,
  label,
  href,
  newTabLabel,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  /** Set for links that open in a new tab. */
  newTabLabel?: string;
}) {
  return (
    <a
      href={href}
      {...(newTabLabel ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group/quick flex flex-col items-center gap-2 rounded-sm border border-border px-2 py-3.5 text-center text-caption font-medium text-text transition-colors duration-200 hover:border-border-strong active:bg-surface-muted"
    >
      <span className="inline-flex size-9 items-center justify-center rounded-sm bg-brand/10 text-brand transition-colors duration-200 group-hover/quick:bg-brand group-hover/quick:text-white">
        <Icon aria-hidden className="size-4" strokeWidth={1.75} />
      </span>
      <span className="leading-tight">{label}</span>
      {newTabLabel && <span className="sr-only"> ({newTabLabel})</span>}
    </a>
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

/** A menu's links as picture tiles, two per row, then a link to all of them. */
function SubMenu({ menu, onNavigate }: { menu: NavMenu; onNavigate: () => void }) {
  return (
    <div className="pb-4 pt-2">
      <ul className="grid grid-cols-2 gap-2">
        {menu.items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="group/tile flex h-full items-center gap-2.5 rounded-sm border border-border bg-background p-2 pr-3 transition-colors duration-200 hover:border-border-strong active:bg-surface-muted"
            >
              {item.image && (
                <span className="relative size-11 shrink-0 overflow-hidden rounded-xs bg-surface-muted">
                  <Image src={item.image} alt="" fill sizes="44px" className="object-contain p-1" />
                </span>
              )}
              <span className="min-w-0 text-small font-medium leading-snug text-text">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={menu.all.href}
        onClick={onNavigate}
        className="group/all mt-3 inline-flex items-center gap-2 px-1 text-small font-medium text-brand-text"
      >
        {menu.all.label}
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-200 group-hover/all:translate-x-0.5"
          strokeWidth={1.75}
        />
      </Link>
    </div>
  );
}
