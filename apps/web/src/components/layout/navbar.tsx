"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { LanguageLinks } from "./language-switcher";
import { MegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";
import type { NavMenuKey, NavModel } from "./nav-types";
import { isActivePath } from "./nav-utils";

const HOVER_CLOSE_DELAY = 150;

/**
 * Public site header. On routes with request-time params the pathname is not
 * known while prerendering, so a copy without active states is the fallback.
 */
export function SiteNavbar({ model }: { model: NavModel }) {
  return (
    <Suspense fallback={<Navbar model={model} pathname={null} />}>
      <CurrentPathNavbar model={model} />
    </Suspense>
  );
}

function CurrentPathNavbar({ model }: { model: NavModel }) {
  return <Navbar model={model} pathname={usePathname()} />;
}

function Navbar({ model, pathname }: { model: NavModel; pathname: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<NavMenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const navRef = useRef<HTMLElement>(null);

  // Close menus after navigation (state adjusted during render, not in an effect).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenMenu(null);
      navRef.current?.querySelector<HTMLButtonElement>(`[aria-controls="menu-${openMenu}"]`)?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openMenu]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const hoverOpen = (menu: NavMenuKey | null) => (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    clearTimeout(closeTimer.current);
    setOpenMenu(menu);
  };
  const hoverClose = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), HOVER_CLOSE_DELAY);
  };
  const closeOnFocusOut = (event: FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenMenu(null);
  };

  const { nav, a11y } = model.labels;
  const contactActive = pathname !== null && isActivePath(pathname, model.contactHref);

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        "group/header sticky top-0 z-50 border-b bg-background transition-[border-color,box-shadow] duration-250",
        scrolled || openMenu ? "border-border" : "border-transparent",
        scrolled && !openMenu && "shadow-sm",
      )}
    >
      <div className="container-page flex h-header items-center gap-8 transition-[height] duration-350 ease-out group-data-[scrolled=true]/header:h-header-compact 2xl:gap-10">
        <Link href={model.homeHref} aria-label={a11y.home} className="-m-1 shrink-0 rounded-xs p-1">
          <Logo className="w-28 transition-[width] duration-350 ease-out xl:w-32 xl:group-data-[scrolled=true]/header:w-28" />
        </Link>

        <nav ref={navRef} aria-label={a11y.mainNavigation} className="hidden h-full xl:block">
          <ul className="flex h-full items-center">
            {model.primary.map((item) => {
              const active = pathname !== null && isActivePath(pathname, item.href, "exact" in item && item.exact);
              const menuKey = item.menu;
              if (menuKey) {
                const open = openMenu === menuKey;
                return (
                  <li
                    key={item.key}
                    className="flex h-full items-center"
                    onPointerEnter={hoverOpen(menuKey)}
                    onPointerLeave={hoverClose}
                    onBlur={closeOnFocusOut}
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`menu-${menuKey}`}
                      onClick={() => setOpenMenu(open ? null : menuKey)}
                      className={navItemClasses(active || open)}
                    >
                      {item.label}
                      <ChevronDown
                        aria-hidden
                        strokeWidth={1.75}
                        className={cn("size-3.5 transition-transform duration-250", open && "rotate-180")}
                      />
                      <ActiveBar visible={active} />
                    </button>
                    <MegaMenu id={`menu-${menuKey}`} open={open} menu={model.menus[menuKey]} />
                  </li>
                );
              }
              return (
                <li key={item.key} className="flex h-full items-center" onPointerEnter={hoverOpen(null)}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(navItemClasses(active), item.accent && "gap-2.5 font-medium text-text")}
                  >
                    {item.accent && <span aria-hidden className="brand-mark" />}
                    {item.label}
                    <ActiveBar visible={active} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={model.contactHref}
            aria-current={contactActive ? "page" : undefined}
            className={cn(
              "hidden h-9 items-center rounded-sm px-3 text-[0.9375rem] transition-colors duration-150 xl:inline-flex",
              contactActive ? "text-text" : "text-text-secondary hover:text-text",
            )}
          >
            {nav.contact}
          </Link>
          {/* Visibility wrappers: cn() does not resolve conflicting display utilities. */}
          <div className="hidden sm:block">
            <ButtonLink href={model.requestQuoteHref} size="sm">
              {nav.requestQuote}
            </ButtonLink>
          </div>
          <div className="ml-4 hidden xl:block">
            <LanguageLinks current={model.locale} label={a11y.language} pathname={pathname} />
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            aria-label={a11y.openMenu}
            className="-mr-2 ml-2 inline-flex h-10 items-center gap-3 rounded-sm px-2 text-small font-medium text-text xl:hidden"
          >
            <span aria-hidden>{nav.menu}</span>
            <span aria-hidden className="flex w-5 flex-col gap-1.5">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-3/5 self-end bg-current" />
            </span>
          </button>
        </div>
      </div>

      <MobileNav model={model} open={mobileOpen} onOpenChange={setMobileOpen} pathname={pathname} />
    </header>
  );
}

function navItemClasses(active: boolean) {
  return cn(
    "relative flex h-full items-center gap-1.5 px-3 text-[0.9375rem] transition-colors duration-150 2xl:px-4",
    active ? "text-text" : "text-text-secondary hover:text-text",
  );
}

/** 2px brand bar sitting on the header's bottom edge for the active section. */
function ActiveBar({ visible }: { visible: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-x-3 -bottom-px h-0.5 bg-brand transition-opacity duration-250 2xl:inset-x-4",
        visible ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
