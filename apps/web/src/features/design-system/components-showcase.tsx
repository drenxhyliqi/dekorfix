import { ArrowRight, Calculator, Download, Factory, Layers, Ruler } from "lucide-react";

import { FeatureCard } from "@/components/cards/feature-card";
import { ProductCard } from "@/components/cards/product-card";
import { ProjectCard } from "@/components/cards/project-card";
import { ResourceCard } from "@/components/cards/resource-card";
import { SolutionCard } from "@/components/cards/solution-card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button, ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/typography";

import { DsLabel, DsSection } from "./ds-section";

const arrow = <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />;

function ButtonMatrix() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" trailingIcon={arrow}>
          Explore Products
        </Button>
        <Button variant="accent" trailingIcon={arrow}>
          Contact us
        </Button>
        <Button variant="secondary">View Projects</Button>
        <Button variant="ghost">Learn More</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button variant="secondary" leadingIcon={<Download aria-hidden className="size-4" strokeWidth={1.75} />}>
          Download PDF
        </Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  );
}

export function ButtonsSection() {
  return (
    <>
      <DsSection
        id="buttons"
        title="Buttons"
        description="Primary (black), Accent (red, one per view), Secondary (outline) and Ghost. 4px radius; the trailing arrow nudges on hover."
      >
        <ButtonMatrix />
      </DsSection>
      <DsSection id="buttons-dark" title="Buttons on dark" tone="dark">
        <ButtonMatrix />
      </DsSection>
    </>
  );
}

export function ElementsSection() {
  return (
    <DsSection id="elements" title="Badges, labels & breadcrumbs">
      <div className="space-y-10">
        <div>
          <DsLabel>Badge</DsLabel>
          <div className="flex flex-wrap gap-3">
            <Badge>Neutral</Badge>
            <Badge variant="outline">PDF</Badge>
            <Badge variant="brand">Coming soon</Badge>
            <Badge variant="inverse">New</Badge>
          </div>
        </div>
        <div>
          <DsLabel>Eyebrow</DsLabel>
          <Eyebrow>Product range</Eyebrow>
        </div>
        <div>
          <DsLabel>Breadcrumbs</DsLabel>
          <Breadcrumbs
            items={[
              { label: "Home", href: "#" },
              { label: "Products", href: "#" },
              { label: "Adhesives" },
            ]}
          />
        </div>
        <div>
          <DsLabel>Text link</DsLabel>
          <ButtonLink href="#" variant="ghost" className="-ml-5" trailingIcon={arrow}>
            Calculate Materials
          </ButtonLink>
        </div>
      </div>
    </DsSection>
  );
}

export function CardsSection() {
  return (
    <DsSection
      id="cards"
      title="Cards"
      description="Shared type, borders, image ratios and hover language; each card leads with what matters for its content. Content below is placeholder."
    >
      <DsLabel>ProductCard: imagery first</DsLabel>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {["Adhesives", "Facades", "Paints", "Plasters & Levelers"].map((category) => (
          <ProductCard
            key={category}
            name="Product name"
            category={category}
            description="Short product descriptor goes here."
            href="#"
          />
        ))}
      </div>

      <div className="mt-section-sm">
        <DsLabel>ProjectCard: photography first</DsLabel>
        <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
          <ProjectCard title="Project title" location="City" year="Year" href="#" />
          <ProjectCard title="Project title" location="City" year="Year" href="#" />
        </div>
      </div>

      <div className="mt-section-sm">
        <DsLabel>ResourceCard: document first</DsLabel>
        <div className="grid gap-6 md:grid-cols-3">
          <ResourceCard title="Document title" kind="Technical data sheet" fileType="PDF" fileSize="— MB" language="SQ" href="#" />
          <ResourceCard title="Document title" kind="Safety data sheet" fileType="PDF" fileSize="— MB" language="EN" href="#" />
          <ResourceCard title="Document title" kind="Product catalogue" fileType="PDF" fileSize="— MB" language="SQ" description="Optional one-line description of the document." href="#" />
        </div>
      </div>

      <div className="mt-section-sm">
        <DsLabel>SolutionCard</DsLabel>
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-3">
          {["01", "02", "03"].map((index) => (
            <SolutionCard
              key={index}
              index={index}
              title="Solution title"
              description="One or two sentences describing the construction system."
              href="#"
            />
          ))}
        </div>
      </div>

      <div className="mt-section-sm">
        <DsLabel>FeatureCard</DsLabel>
        <div className="grid gap-x-6 gap-y-10 md:grid-cols-3">
          <FeatureCard icon={Ruler} title="Feature title">
            Supporting sentence for a feature or benefit.
          </FeatureCard>
          <FeatureCard icon={Calculator} title="Feature title">
            Supporting sentence for a feature or benefit.
          </FeatureCard>
          <FeatureCard icon={Factory} title="Feature title">
            Supporting sentence for a feature or benefit.
          </FeatureCard>
        </div>
      </div>

      <div className="mt-section-sm">
        <DsLabel>Icons (lucide-react, 1.25–1.75 stroke)</DsLabel>
        <div className="flex gap-6 text-text">
          {[Ruler, Calculator, Factory, Layers, Download, ArrowRight].map((Icon, index) => (
            <Icon key={index} aria-hidden className="size-6" strokeWidth={1.5} />
          ))}
        </div>
      </div>
    </DsSection>
  );
}
