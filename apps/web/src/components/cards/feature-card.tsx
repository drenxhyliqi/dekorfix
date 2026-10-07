import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Non-interactive point: optional icon, title and supporting text. */
export function FeatureCard({
  icon: Icon,
  title,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-border pt-6">
      {Icon && <Icon aria-hidden className="size-6 text-text" strokeWidth={1.25} />}
      <h3 className="text-h4 text-text">{title}</h3>
      <div className="text-body text-text-secondary">{children}</div>
    </div>
  );
}
