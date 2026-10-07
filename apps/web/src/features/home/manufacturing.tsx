import Image from "next/image";

import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

import "./manufacturing.css";

/**
 * Homepage manufacturing and quality section: the plant in Shirokë in a
 * three-photo collage (drifting at different depths as it scrolls), the copy
 * beside it, and the certifications set large underneath.
 */
export function Manufacturing({ t }: { t: Dictionary }) {
  const copy = t.home.manufacturing;
  const credentials = t.home.credentials;

  return (
    <section aria-labelledby="manufacturing-title" className="overflow-hidden bg-background py-section">
      <div className="container-page">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="flex items-center gap-2.5 text-label uppercase text-brand-text">
              <span aria-hidden className="brand-mark" />
              {copy.eyebrow}
            </p>
            <h2 id="manufacturing-title" className="mt-6 text-h1 text-balance text-text">
              {copy.title}
            </h2>
            <p className="mt-6 max-w-lg text-lead text-text-secondary">{copy.text}</p>
            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-6 border-t border-border pt-6">
              {copy.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-label uppercase text-text-tertiary">{fact.label}</dt>
                  <dd className="mt-2 text-body font-medium text-text">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mf-collage lg:col-span-7 lg:col-start-6">
            <Shot
              src="/images/photos/plant-loading.webp"
              alt={copy.photos.loading}
              width={1200}
              height={921}
              className="mf-shot--main"
              sizes="(min-width: 1024px) 45vw, 80vw"
            />
            <Shot
              src="/images/photos/plant-forklift.webp"
              alt={copy.photos.forklift}
              width={960}
              height={720}
              className="mf-shot--top"
              sizes="(min-width: 1024px) 25vw, 45vw"
            />
            <Shot
              src="/images/photos/plant-dispatch.webp"
              alt={copy.photos.dispatch}
              width={960}
              height={720}
              className="mf-shot--bottom"
              sizes="(min-width: 1024px) 25vw, 45vw"
            />
          </div>
        </div>

        <ul className="mt-section-sm grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
          {credentials.map((item, index) => (
            <li
              key={item.code}
              className={cn(
                "flex flex-col gap-4 py-8 sm:px-8",
                index > 0 && "border-t border-border sm:border-t-0",
                index % 2 === 1 && "sm:border-l",
                index >= 2 && "sm:border-t lg:border-t-0",
                index > 0 && "lg:border-l",
                index % 2 === 0 && "sm:pl-0 lg:pl-8",
                index === 0 && "lg:pl-0",
              )}
            >
              <span className="flex items-center gap-3 text-h2 tabular-nums text-text">
                <span aria-hidden className="brand-mark" />
                {item.code}
              </span>
              <span className="max-w-xs text-small text-text-secondary">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Shot({
  src,
  alt,
  width,
  height,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  sizes: string;
}) {
  return (
    <figure className={cn("mf-shot", className)}>
      <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className="h-full w-full object-cover" />
    </figure>
  );
}
