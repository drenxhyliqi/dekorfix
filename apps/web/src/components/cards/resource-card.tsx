import { Download, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { CardLink } from "./card-link";

export interface ResourceCardProps {
  title: string;
  href: string;
  /** Document type, e.g. "PDF", "DWG". */
  fileType: string;
  /** e.g. "Technical data sheet". */
  kind?: string;
  fileSize?: string;
  language?: string;
  description?: string;
  /** Label of the action line, e.g. "Download". */
  actionLabel?: string;
}

/** Document-led card: type, metadata and a clear download affordance. */
export function ResourceCard({
  title,
  href,
  fileType,
  kind,
  fileSize,
  language,
  description,
  actionLabel = "Download",
}: ResourceCardProps) {
  const meta = [fileSize, language].filter(Boolean).join(" · ");
  return (
    <article className="group relative flex h-full flex-col rounded-xs border border-border bg-surface p-6 transition-[border-color,background-color] duration-250 hover:border-border-strong hover:bg-surface-muted">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-text-secondary">
          <FileText aria-hidden className="size-5" strokeWidth={1.5} />
          {kind && <span className="text-small">{kind}</span>}
        </div>
        <Badge variant="outline">{fileType}</Badge>
      </div>
      <h3 className="mt-10 text-h4 text-text">
        <CardLink href={href}>{title}</CardLink>
      </h3>
      {description && <p className="mt-2 line-clamp-2 text-small text-text-secondary">{description}</p>}
      <div className="mt-auto pt-8">
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4 text-small">
          <span className="text-text-tertiary tabular-nums">{meta}</span>
          <span className="flex items-center gap-2 font-medium text-text">
            {actionLabel}
            <Download
              aria-hidden
              className="size-4 transition-transform duration-250 ease-out group-hover:translate-y-0.5"
              strokeWidth={1.75}
            />
          </span>
        </div>
      </div>
    </article>
  );
}
