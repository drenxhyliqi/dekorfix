import Image from "next/image";

import { Section } from "@/components/ui/section";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function Manufacturing({ t }: { t: Dictionary }) {
  const copy = t.home.manufacturing;
  return (
    <Section aria-labelledby="manufacturing-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5 lg:pr-8">
          <div className="lg:sticky lg:top-28">
            <Eyebrow className="mb-6">{copy.eyebrow}</Eyebrow>
            <Heading id="manufacturing-title" size="h2">
              {copy.title}
            </Heading>
            <Text className="mt-6">{copy.text}</Text>
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-6">
              {copy.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-label uppercase text-text-tertiary">{fact.label}</dt>
                  <dd className="mt-2 text-body text-text">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-7">
          <Photo src="/images/photos/plant-loading.webp" alt={copy.photos.loading} className="col-span-2 aspect-[4/3]" sizes="(min-width: 1024px) 55vw, 100vw" />
          <Photo src="/images/photos/plant-forklift.webp" alt={copy.photos.forklift} className="aspect-[4/3]" sizes="(min-width: 1024px) 27vw, 50vw" />
          <Photo src="/images/photos/plant-dispatch.webp" alt={copy.photos.dispatch} className="aspect-[4/3]" sizes="(min-width: 1024px) 27vw, 50vw" />
        </div>
      </div>
    </Section>
  );
}

function Photo({ src, alt, className, sizes }: { src: string; alt: string; className: string; sizes: string }) {
  return (
    <div className={`relative overflow-hidden bg-surface-muted ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
