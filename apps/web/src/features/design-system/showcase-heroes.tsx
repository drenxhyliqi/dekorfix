import { Hero } from "@/components/layout/hero";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";

import { DsSection } from "./ds-section";

export function HeroesShowcase() {
  return (
    <>
      <DsSection
        id="hero"
        title="Hero & page header"
        description="Hero supports eyebrow, breadcrumbs, two CTAs, image/video/placeholder media, split or stacked layout and light or dark tone. Shown below at full width."
      >
        <p className="text-small text-text-secondary">
          Variants follow: split / light, stacked / dark, then the compact PageHeader and a dark Section with a SectionHeader.
        </p>
      </DsSection>
      <Hero
        eyebrow="Eyebrow"
        title="Hero heading set in the H1 style"
        description="A supporting paragraph of one or two sentences that explains the page."
        primaryAction={{ label: "Explore Products", href: "#" }}
        secondaryAction={{ label: "Start a Project", href: "#" }}
        media={{ kind: "placeholder", label: "Hero image pending" }}
        breadcrumbs={[{ label: "Home", href: "#" }, { label: "Section" }]}
      />
      <Hero
        tone="dark"
        layout="stacked"
        titleSize="display"
        eyebrow="Eyebrow"
        title="Display heading for the homepage"
        description="Stacked layout: the statement first, then a wide media band."
        primaryAction={{ label: "Calculate Materials", href: "#", variant: "accent" }}
        secondaryAction={{ label: "View Projects", href: "#" }}
        media={{ kind: "placeholder", label: "Hero video pending" }}
      />
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "#" }, { label: "Resources" }]}
        eyebrow="Eyebrow"
        title="Page header for inner pages"
        description="Compact intro without media, used for listings and documents."
        actions={
          <ButtonLink href="#" variant="secondary" size="sm">
            Secondary action
          </ButtonLink>
        }
      />
      <Section tone="dark">
        <SectionHeader
          eyebrow="Section"
          title="Dark sections for brand statements and Project Studio"
          description="SectionHeader aligns the title left and supporting copy right on desktop."
          action={
            <ButtonLink href="#" variant="accent">
              Start a Project
            </ButtonLink>
          }
        />
      </Section>
    </>
  );
}
