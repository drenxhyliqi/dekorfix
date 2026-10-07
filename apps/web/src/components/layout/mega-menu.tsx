import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { MenuPromo } from "./menu-promo";
import type { NavMenu } from "./nav-types";

/** Full-width panel under the header for Products / Solutions (desktop). */
export function MegaMenu({ id, open, menu }: { id: string; open: boolean; menu: NavMenu }) {
  const numbered = menu.items.some((item) => item.description);
  return (
    <div
      id={id}
      className={cn(
        "absolute inset-x-0 top-full border-b border-border bg-background shadow-lg",
        "transition-[opacity,translate,visibility] duration-250 ease-out",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
      )}
    >
      <div className="container-page grid grid-cols-12 gap-8 py-10">
        <div className="col-span-8">
          <p className="mb-6 text-label uppercase text-text-tertiary">{menu.heading}</p>
          <ul className="grid grid-cols-2 border-t border-border">
            {menu.items.map((item, index) => (
              <li key={item.key} className="border-b border-border odd:border-r odd:pr-8 even:pl-8">
                <Link href={item.href} className="group/item flex items-start gap-6 py-5">
                  {numbered && (
                    <span className="pt-1 text-small tabular-nums text-text-tertiary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-4 text-h4 text-text">
                      {item.label}
                      <ArrowRight
                        aria-hidden
                        strokeWidth={1.5}
                        className="size-4 -translate-x-1 text-brand opacity-0 transition-[opacity,translate] duration-250 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                      />
                    </span>
                    {item.description && (
                      <span className="mt-1 block text-small text-text-secondary">{item.description}</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
            <li className="border-b border-border odd:border-r odd:pr-8 even:pl-8">
              <Link
                href={menu.all.href}
                className="group/item flex h-full items-center justify-between gap-4 py-5"
              >
                <span className="text-h4 text-text">{menu.all.label}</span>
                <ArrowRight
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-5 text-text transition-transform duration-250 group-hover/item:translate-x-1"
                />
              </Link>
            </li>
          </ul>
        </div>
        <MenuPromo promo={menu.promo} className="col-span-4" />
      </div>
    </div>
  );
}
