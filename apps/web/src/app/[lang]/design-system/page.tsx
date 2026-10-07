import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import {
  ButtonsSection,
  CardsSection,
  ElementsSection,
} from "@/features/design-system/components-showcase";
import { DsSection } from "@/features/design-system/ds-section";
import {
  ColorsSection,
  SpacingSection,
  TypographySection,
} from "@/features/design-system/foundations";
import { FormsShowcase, OverlaysShowcase } from "@/features/design-system/interactive-showcase";
import { HeroesShowcase } from "@/features/design-system/showcase-heroes";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const contents = [
  ["colors", "Colour"],
  ["typography", "Typography"],
  ["spacing", "Spacing"],
  ["buttons", "Buttons"],
  ["elements", "Elements"],
  ["cards", "Cards"],
  ["forms", "Forms"],
  ["overlays", "Tabs & overlays"],
  ["hero", "Hero"],
] as const;

/** Internal reference of Dekorfix tokens and components (not indexed). */
export default function DesignSystemPage() {
  return (
    <>
      <PageHeader
        eyebrow="Internal · Phase 1"
        title="Dekorfix design system"
        description="Tokens and components every page is built from. Content shown here is placeholder."
      />
      <Container as="nav" className="py-6" >
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-small text-text-secondary">
          {contents.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="transition-colors hover:text-text">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </Container>
      <ColorsSection />
      <TypographySection />
      <SpacingSection />
      <ButtonsSection />
      <ElementsSection />
      <CardsSection />
      <DsSection id="forms" title="Forms" description="Strong labels, 48px controls, clear focus and error states. Field wires labels, descriptions and errors for screen readers.">
        <FormsShowcase />
      </DsSection>
      <DsSection id="overlays" title="Tabs & overlays">
        <OverlaysShowcase />
      </DsSection>
      <HeroesShowcase />
    </>
  );
}
