import { Phone } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { SocialIcon } from "@/components/brand/social-icons";
import { company } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries/en";

import "./social-rail.css";

/**
 * Instagram, Facebook and a call button, floating at the left edge of every
 * page on wide screens (smaller screens have the same links in the menu).
 */
export function SocialRail({ labels }: { labels: Dictionary["header"] }) {
  const network = (key: "instagram" | "facebook") => company.social.find((item) => item.key === key);
  const instagram = network("instagram");
  const facebook = network("facebook");
  const phone = company.phones[0];
  const items = [
    instagram && { key: "instagram", href: instagram.href, label: instagram.label, external: true, icon: <SocialIcon network="instagram" className="size-[1.125rem]" /> },
    facebook && { key: "facebook", href: facebook.href, label: facebook.label, external: true, icon: <SocialIcon network="facebook" className="size-[1.125rem]" /> },
    { key: "call", href: phone.href, label: `${labels.call}: ${phone.display}`, external: false, icon: <Phone aria-hidden className="size-[1.125rem]" strokeWidth={1.75} /> },
  ].filter((item) => Boolean(item)) as Array<{ key: string; href: string; label: string; external: boolean; icon: ReactNode }>;

  return (
    <nav aria-label={labels.follow} className="sr-rail">
      <span aria-hidden className="sr-line" />
      <ul className="sr-list">
        {items.map((item, index) => (
          <li key={item.key} style={{ "--i": index } as CSSProperties}>
            <a
              href={item.href}
              aria-label={item.label}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className={item.key === "call" ? "sr-link sr-link--call" : "sr-link"}
            >
              {item.icon}
              <span aria-hidden className="sr-tip">
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <span aria-hidden className="sr-line" />
    </nav>
  );
}
