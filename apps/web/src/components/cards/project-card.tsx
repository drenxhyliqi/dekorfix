import { ArrowUpRight } from "lucide-react";

import { MediaFrame, type MediaImage, type MediaRatio } from "@/components/ui/media";

import { CardLink } from "./card-link";

export interface ProjectCardProps {
  title: string;
  href: string;
  location?: string;
  year?: string;
  image?: MediaImage;
  /** Use a wider ratio for featured projects. */
  ratio?: Extract<MediaRatio, "4/3" | "3/2" | "16/9" | "4/5">;
}

/** Photography-led: large image, quiet metadata. */
export function ProjectCard({ title, href, location, year, image, ratio = "4/3" }: ProjectCardProps) {
  const meta = [location, year].filter(Boolean).join(" · ");
  return (
    <article className="group relative flex flex-col">
      <MediaFrame
        ratio={ratio}
        image={image}
        zoomOnHover
        sizes="(min-width: 1024px) 50vw, 100vw"
        placeholderLabel="Project photography pending"
      />
      <div className="flex items-start justify-between gap-6 border-b border-border py-5 transition-colors duration-250 group-hover:border-text">
        <div className="space-y-1.5">
          {meta && <p className="text-small text-text-tertiary">{meta}</p>}
          <h3 className="text-h3 text-text">
            <CardLink href={href}>{title}</CardLink>
          </h3>
        </div>
        <ArrowUpRight
          aria-hidden
          strokeWidth={1.5}
          className="mt-1 size-6 shrink-0 text-text-tertiary transition-[color,translate] duration-250 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-text"
        />
      </div>
    </article>
  );
}
