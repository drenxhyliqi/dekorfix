import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { StudioLoader } from "@/features/project-studio/components/studio-loader";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({
    title: t.pages.projectStudio.title,
    description: t.pages.projectStudio.description,
    path: routes.projectStudio,
  });
}

export default async function ProjectStudioPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <div className="bg-surface-muted pb-section-sm">
      <Container className="grid gap-6 pb-8 pt-10 md:pt-12 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="lg:col-span-7">
          <Eyebrow className="mb-5">{t.studio.intro.eyebrow}</Eyebrow>
          <Heading as="h1" size="h2">
            {t.studio.intro.title}
          </Heading>
        </div>
        <Text size="body" className="lg:col-span-4 lg:col-start-9">
          {t.studio.intro.description}
        </Text>
      </Container>
      <Container>
        <StudioLoader t={t.studio} locale={locale} />
      </Container>
    </div>
  );
}
