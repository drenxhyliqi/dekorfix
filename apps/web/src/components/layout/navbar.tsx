"use client";

import { ArrowRight, ChevronDown, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { CartButton } from "@/features/shop/cart-drawer";
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
  const loginActive = pathname !== null && isActivePath(pathname, model.loginHref);

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        "group/header sticky top-0 z-50 border-b border-border transition-[background-color,box-shadow] duration-250",
        // Frosted once content scrolls beneath; solid while a mega menu is open.
        scrolled && !openMenu ? "bg-background/90 backdrop-blur-xl backdrop-saturate-150" : "bg-background",
      )}
    >
      <div className="container-page flex h-16 items-center gap-6 transition-[height] duration-350 ease-out xl:h-18 xl:group-data-[scrolled=true]/header:h-16">
        <Link href={model.homeHref} aria-label={a11y.home} className="-m-1 shrink-0 rounded-xs p-1">
          <Logo className="w-26 sm:w-28" />
        </Link>

        <nav ref={navRef} aria-label={a11y.mainNavigation} className="hidden h-full flex-1 justify-center xl:flex">
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
                      <ActiveDot visible={active} />
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
                    className={cn(navItemClasses(active), item.accent && "gap-2 font-medium text-text")}
                  >
                    {item.accent && <span aria-hidden className="brand-mark" />}
                    {item.label}
                    <ActiveDot visible={active} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 xl:ml-0">
          {/* Visibility wrappers: cn() does not resolve conflicting display utilities. */}
          <div className="hidden md:block">
            <IconLink href={model.searchHref} label={nav.search}>
              <Search aria-hidden className="size-[1.125rem]" strokeWidth={1.5} />
            </IconLink>
          </div>
          <IconLink href={model.loginHref} label={nav.login} current={loginActive}>
            <UserRound aria-hidden className="size-[1.125rem]" strokeWidth={1.5} />
          </IconLink>
          <CartButton />
          <div className="hidden items-center xl:flex">
            <span aria-hidden className="mx-3 h-5 w-px bg-border" />
            <LanguageLinks current={model.locale} label={a11y.language} pathname={pathname} />
          </div>
          <div className="ml-3 hidden sm:block">
            <ButtonLink
              href={model.talkHref}
              size="sm"
              trailingIcon={<ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />}
            >
              {nav.talk}
            </ButtonLink>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            aria-label={a11y.openMenu}
            className="group/menu -mr-2 ml-1 inline-flex size-10 items-center justify-center rounded-sm text-text transition-colors duration-150 hover:bg-surface-muted xl:hidden"
          >
            <span aria-hidden className="flex w-5 flex-col gap-1.5">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-3/5 self-end bg-current transition-[width] duration-250 ease-out group-hover/menu:w-full" />
            </span>
          </button>
        </div>
      </div>

      <MobileNav model={model} open={mobileOpen} onOpenChange={setMobileOpen} pathname={pathname} />
    </header>
  );
}

/** Round, icon-only link (search, account). */
function IconLink({
  href,
  label,
  current,
  children,
}: {
  href: string;
  label: string;
  current?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      aria-current={current ? "page" : undefined}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-sm transition-colors duration-150 hover:bg-surface-muted hover:text-text",
        current ? "bg-surface-muted text-text" : "text-text-secondary",
      )}
    >
      {children}
    </Link>
  );
}

function navItemClasses(active: boolean) {
  return cn(
    "relative flex h-full items-center gap-1 px-2.5 text-[0.9375rem] tracking-[-0.01em] transition-colors duration-150 2xl:px-3.5",
    active ? "text-text" : "text-text-secondary hover:text-text",
  );
}

/** Small brand dot under the active section's label. */
function ActiveDot({ visible }: { visible: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute bottom-3 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand transition-transform duration-250 ease-out",
        visible ? "scale-100" : "scale-0",
      )}
    />
  );
}
