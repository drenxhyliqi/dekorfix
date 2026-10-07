import { DsLabel, DsSection } from "./ds-section";

const colorTokens = [
  ["brand", "Logo red #E41E25: CTAs, active states, accents"],
  ["brand-hover", "Pressed / hover red"],
  ["brand-soft", "Tinted backgrounds for brand badges"],
  ["brand-text", "Small red text on brand-soft"],
  ["background", "Page background"],
  ["surface-muted", "Alternate sections, media frames"],
  ["surface-strong", "Hover surfaces, neutral badges"],
  ["text", "Headings, primary text, primary buttons"],
  ["text-secondary", "Body copy"],
  ["text-tertiary", "Metadata, captions"],
  ["border", "Hairlines, dividers"],
  ["border-strong", "Inputs, secondary buttons"],
  ["danger", "Form errors only"],
] as const;

function Swatches() {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
      {colorTokens.map(([token, usage]) => (
        <li key={token}>
          <div
            className="aspect-[3/2] rounded-xs border border-border"
            style={{ backgroundColor: `var(--color-${token})` }}
          />
          <p className="mt-3 text-small font-medium text-text">--color-{token}</p>
          <p className="text-caption text-text-tertiary">{usage}</p>
        </li>
      ))}
    </ul>
  );
}

export function ColorsSection() {
  return (
    <>
      <DsSection
        id="colors"
        title="Colour"
        description="Black and white carry the interface; Dekorfix red is a deliberate accent. Components only use semantic tokens."
      >
        <Swatches />
      </DsSection>
      <DsSection
        id="colors-dark"
        title="Dark tone"
        description='The same tokens re-mapped by data-tone="dark". Used for the footer and selected storytelling sections.'
        tone="dark"
      >
        <Swatches />
      </DsSection>
    </>
  );
}

const typeClasses = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
  lead: "text-lead",
  body: "text-body",
  small: "text-small",
  label: "text-label uppercase",
  caption: "text-caption",
} as const;

const typeScale = [
  ["display", "Display", "Materiale ndërtimore me precizion"],
  ["h1", "H1", "Building materials, made with precision"],
  ["h2", "H2", "Ngjitës, fasada, baza, ngjyra dhe llaqe"],
  ["h3", "H3", "Systems for walls, floors and facades"],
  ["h4", "H4", "Technical data and documentation"],
  ["lead", "Lead", "Lead paragraphs introduce a page or section in one or two calm sentences."],
  ["body", "Body", "Body copy is set at 16–17px with generous line height for long technical descriptions. Shqip: çdo shkronjë, përfshirë ë dhe ç, mbështetet plotësisht."],
  ["small", "Small", "Supporting text, form descriptions and card metadata."],
  ["label", "Label", "SECTION LABEL · EYEBROW"],
  ["caption", "Caption", "Captions and fine print."],
] as const;

export function TypographySection() {
  return (
    <DsSection
      id="typography"
      title="Typography"
      description="Geist, one variable family. Headings use weight 500 with tight tracking. Sizes scale fluidly between mobile and desktop."
    >
      <ul className="divide-y divide-border border-y border-border">
        {typeScale.map(([token, name, sample]) => (
          <li key={token} className="grid gap-3 py-6 md:grid-cols-[8rem_1fr] md:items-baseline md:gap-8">
            <span className="text-small text-text-tertiary">
              {name} <span className="text-caption">· text-{token}</span>
            </span>
            <span className={`${typeClasses[token]} text-text`}>
              {sample}
            </span>
          </li>
        ))}
      </ul>
    </DsSection>
  );
}

const spacing = [4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120, 160];

export function SpacingSection() {
  return (
    <DsSection
      id="spacing"
      title="Spacing, radius & elevation"
      description="A 4px base. Sections use the fluid --spacing-section (80–160px). Radius stays between 2 and 6px."
    >
      <DsLabel>Spacing scale (px)</DsLabel>
      <ul className="space-y-2">
        {spacing.map((value) => (
          <li key={value} className="flex items-center gap-4">
            <span className="w-10 text-right text-caption tabular-nums text-text-tertiary">{value}</span>
            <span className="h-3 bg-brand" style={{ width: value }} />
            <span className="text-caption text-text-tertiary">p-{value / 4}</span>
          </li>
        ))}
      </ul>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <div>
          <DsLabel>Radius</DsLabel>
          <div className="flex gap-6">
            {(["xs", "sm", "md"] as const).map((radius) => (
              <div key={radius} className="text-center">
                <div
                  className="size-20 border border-border-strong bg-surface-muted"
                  style={{ borderRadius: `var(--radius-${radius})` }}
                />
                <p className="mt-2 text-caption text-text-tertiary">{radius}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <DsLabel>Shadow</DsLabel>
          <div className="flex gap-6">
            {(["sm", "md", "lg"] as const).map((shadow) => (
              <div key={shadow} className="text-center">
                <div
                  className="size-20 rounded-xs bg-surface"
                  style={{ boxShadow: `var(--shadow-${shadow})` }}
                />
                <p className="mt-2 text-caption text-text-tertiary">{shadow}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DsSection>
  );
}
