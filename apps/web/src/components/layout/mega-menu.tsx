import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { NavMenu } from "./nav-types";

/** Full-width panel under the header for Products / Product finder (desktop): the heading beside picture tiles. */
export function MegaMenu({ id, open, menu }: { id: string; open: boolean; menu: NavMenu }) {
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
        <div className="col-span-3 flex flex-col">
          <p className="text-label uppercase text-text-tertiary">{menu.heading}</p>
          <p className="mt-4 max-w-xs text-body text-text-secondary">{menu.intro}</p>
          <Link
            href={menu.all.href}
            className="group/all mt-auto inline-flex items-center gap-2 pt-8 text-[0.9375rem] font-medium text-text hover:text-brand-text"
          >
            {menu.all.label}
            <ArrowRight
              aria-hidden
              strokeWidth={1.75}
              className="size-4 transition-transform duration-250 group-hover/all:translate-x-1"
            />
          </Link>
        </div>

        <ul className="col-span-9 grid grid-cols-3 gap-3">
          {menu.items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="group/item flex h-full items-center gap-4 rounded-sm border border-border p-3 pr-4 transition-colors duration-200 hover:border-border-strong hover:bg-surface-muted"
              >
                {item.image && (
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-surface-muted transition-colors duration-200 group-hover/item:bg-background">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1.5 transition-transform duration-300 ease-out group-hover/item:scale-105"
                    />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3 text-[1.0625rem] font-medium text-text">
                    {item.label}
                    <ArrowRight
                      aria-hidden
                      strokeWidth={1.5}
                      className="size-4 shrink-0 -translate-x-1 text-brand opacity-0 transition-[opacity,translate] duration-250 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                    />
                  </span>
                  {item.description && (
                    <span className="mt-1 line-clamp-2 block text-small text-text-secondary">{item.description}</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
