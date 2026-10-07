# DEKORFIX — PHASE 1

## Premium Design System + Global Website Shell

You are a senior product designer and senior frontend engineer.

The Dekorfix project structure has already been created.

Your task in this phase is to establish the **complete visual foundation and global UI system** before building the individual website pages.

Do not start building the full homepage yet.

First create a premium, modern, minimalistic design system that all future Dekorfix pages will use.

---

# 1. FIRST: INSPECT THE EXISTING PROJECT

Before changing anything:

1. Inspect the entire repository structure.
2. Read the existing configuration files.
3. Identify the existing Next.js setup.
4. Identify the current Tailwind setup.
5. Identify the existing font configuration.
6. Identify existing shared components.
7. Identify existing assets.
8. Identify the existing logo if it is already available.
9. Do not unnecessarily replace working project configuration.

Preserve the architecture established during Phase 0.

Do not introduce unnecessary dependencies.

---

# 2. INSPECT THE REAL DEKORFIX BRAND

Use the current Dekorfix website as the primary brand reference:

https://dekorfix.net/

The current Dekorfix identity uses a **black + red logo/brand treatment**.

The redesign must preserve recognition of the existing Dekorfix brand.

Do NOT invent a completely different brand identity.

However, the new website should feel significantly more premium and contemporary than the current website.

The current website is primarily a reference for:

* Logo
* Brand colors
* Product categories
* Existing product terminology
* Existing company identity

Do NOT copy its layout or visual design.

We are redesigning the experience from the ground up.

---

# 3. BRAND COLOR SYSTEM

Use the actual Dekorfix logo/brand as the source of truth for the primary brand colors.

Inspect the logo asset directly if available.

If the exact red value is available from the logo, use that exact value.

Do not arbitrarily invent a new red.

Create semantic design tokens such as:

```text
--color-brand
--color-brand-hover
--color-brand-soft
--color-background
--color-surface
--color-surface-muted
--color-text
--color-text-secondary
--color-border
--color-border-strong
```

The visual hierarchy should generally be:

### Primary

Black / near-black

Used for:

* Main typography
* Navigation
* Headings
* Primary dark sections
* Strong UI elements

### Secondary

White / off-white / very light neutral

Used for:

* Main backgrounds
* Product sections
* Cards
* Content areas

### Accent

Dekorfix red

Used strategically for:

* Primary CTA
* Active navigation state
* Important interactive states
* Small visual accents
* Product highlights
* Links where appropriate

Do NOT make the entire website red.

The red should feel like an intentional premium brand accent.

Avoid:

* Red backgrounds everywhere
* Red gradients
* Excessive red buttons
* Neon colors
* Random secondary colors

---

# 4. OVERALL DESIGN DIRECTION

The website should feel like a **premium European architectural materials / construction materials manufacturer**.

Think:

* Architecture
* Materials
* Surfaces
* Precision
* Manufacturing
* Engineering
* Modern interiors
* European product brands

NOT:

* Generic construction company
* Cheap building-material catalog
* Generic WordPress theme
* SaaS dashboard
* AI-generated landing page
* Startup website
* Gaming interface

The design should communicate:

**Quality + Precision + Trust + Material Expertise**

---

# 5. VISUAL LANGUAGE

Use:

* Large typography
* Strong whitespace
* Clean grids
* Editorial layouts
* High-quality imagery
* Precise spacing
* Thin borders
* Subtle shadows
* Restrained radius
* Strong alignment
* Large product photography
* Architectural compositions

The interface should feel expensive because of:

**Typography + spacing + composition**

not because of excessive effects.

Avoid:

* Excessive glassmorphism
* Excessive rounded cards
* Huge gradients
* Neon
* Floating blobs
* Excessive shadows
* Excessive animations
* Generic "AI website" aesthetics

---

# 6. TYPOGRAPHY

Choose a premium modern font pairing.

Prioritize fonts that feel:

* Contemporary
* Architectural
* Professional
* Highly readable
* Excellent at large display sizes
* Excellent in Albanian and English

Strong candidates to evaluate:

* Inter
* Manrope
* Geist
* Plus Jakarta Sans
* DM Sans

You may choose another font if it clearly fits the brand better.

Do not use more than 2 font families.

Prefer one excellent sans-serif family with multiple weights unless a second family adds genuine value.

Typography should have a strong hierarchy:

```text
Display
H1
H2
H3
Body
Small
Label
Caption
```

Large headings should feel editorial and confident.

Do not make every heading bold.

---

# 7. TYPOGRAPHIC SCALE

Establish a consistent responsive type scale.

For example:

```text
Display:
64–88px desktop

H1:
52–72px

H2:
40–56px

H3:
28–36px

Body:
16–18px

Small:
14px

Label:
12–13px
```

These are starting points, not strict requirements.

Adjust based on the chosen font.

Typography must scale elegantly on mobile.

---

# 8. SPACING SYSTEM

Create a consistent spacing system.

Use a predictable scale rather than random margins.

For example:

```text
4
8
12
16
24
32
48
64
80
96
120
160
```

Large sections should have generous vertical spacing.

The site should breathe.

---

# 9. CONTAINER SYSTEM

Create a reusable page container.

Desktop content should generally stay within a premium max-width rather than stretching indefinitely.

Example:

```text
max-width: 1440px
```

with responsive horizontal padding.

Create reusable utilities/components rather than repeating container classes everywhere.

---

# 10. BUTTON SYSTEM

Buttons are extremely important.

They should feel **premium, precise and intentional**.

Create a reusable Button component.

Required variants:

### Primary

Dark/black background with white text.

### Accent

Dekorfix red background with white text.

### Secondary

White/transparent background with dark border.

### Ghost

Minimal/no background.

Buttons should have:

* Proper height
* Excellent typography
* Balanced horizontal padding
* Subtle hover transition
* Clear focus state
* Accessible contrast

Avoid:

* Giant pill-shaped buttons
* Excessive rounded corners
* Gradient buttons
* Overly playful animations

Use a restrained radius.

Something around:

`4px–8px`

depending on the final design.

Button text should be concise.

Examples:

```text
Explore Products
View Projects
Start a Project
Calculate Materials
Request a Quote
Learn More
```

Use subtle transitions.

For example:

* background transition
* border transition
* slight icon movement

Do not create exaggerated hover animations.

---

# 11. ICONS

Use a consistent icon strategy.

Do not randomly mix multiple icon libraries.

If the project already has an icon system, preserve it.

If no icon system exists, choose one professional, lightweight system and use it consistently.

Icons should be subtle and functional.

Do not use icons simply to decorate every card.

---

# 12. NAVIGATION

Create the global Dekorfix navbar.

It should feel premium and minimal.

Desktop structure:

```text
DEKORFIX

Products
Solutions
Projects
Project Studio
Resources
About

                         Contact
                         SQ | EN
```

Adjust labels to the actual final information architecture.

Important:

**Project Studio should have strong visibility.**

It is one of Dekorfix's major differentiating features.

The navbar should not feel crowded.

Use a clean dropdown/mega-menu architecture for Products and potentially Solutions.

Products should be grouped by actual Dekorfix categories:

* Adhesives
* Facades
* Primers / Bases
* Paints
* Plasters / Levelers

Use the existing Dekorfix product categories as the content reference. The current site already organizes products around categories such as adhesives, facades, bases, paints and plasters.

Do not populate the final navigation with invented products.

---

# 13. NAVBAR BEHAVIOR

Implement:

### Desktop

Clean horizontal navigation.

### Scroll

The navbar may become slightly more compact after scrolling.

Use subtle transitions.

### Mobile

Create a premium mobile navigation drawer.

It should include:

* Navigation links
* Product categories
* Project Studio
* Language switcher
* Contact CTA

Do not create a generic hamburger menu.

---

# 14. HEADER / HERO FOUNDATION

Create a reusable Hero component.

Do not build the actual homepage hero yet.

The component should support:

* Eyebrow
* Heading
* Description
* Primary CTA
* Secondary CTA
* Image
* Video
* Dark/light variants
* Optional breadcrumbs

This will later be used across:

* Home
* Products
* Solutions
* Projects
* About
* Resources
* Project Studio

---

# 15. CARD SYSTEM

Create a reusable Card system.

Possible variants:

```text
ProductCard
ProjectCard
ResourceCard
SolutionCard
FeatureCard
```

Cards should not all look identical.

However, they should share:

* Typography
* Spacing
* Borders
* Hover behavior
* Image ratios
* Interaction language

Product cards should emphasize product imagery.

Project cards should emphasize photography.

Resource cards should emphasize document/type information.

---

# 16. IMAGE TREATMENT

Photography should feel architectural and premium.

Use large images rather than tiny thumbnails whenever possible.

Preferred image treatment:

* Large crops
* Strong aspect ratios
* Minimal borders
* Minimal effects

Avoid:

* Heavy overlays
* Fake gradients over every image
* Excessive rounded corners
* Stock-photo-looking compositions

When image assets are missing, use clearly marked placeholders rather than inventing fake Dekorfix photography.

---

# 17. FORM SYSTEM

Create reusable:

* Input
* Select
* Textarea
* Checkbox
* Radio
* Field
* FormSection

Forms should have:

* Strong labels
* Clean borders
* Clear focus states
* Error states
* Helpful descriptions
* Good spacing

This will later be used for:

* Contact
* Quote request
* Calculator
* Project Studio

---

# 18. DESIGN SYSTEM COMPONENTS

Create a reusable foundation including, where appropriate:

```text
Button
Container
Section
Heading
Badge
Input
Select
Textarea
Card
Modal
Drawer
Tabs
Breadcrumbs
Navbar
Footer
Hero
PageHeader
```

Do not overbuild components that are not yet needed.

The goal is a clean foundation.

---

# 19. FOOTER

Create the global Dekorfix footer.

It should feel substantial and premium.

Possible structure:

```text
DEKORFIX

Products
Solutions
Projects
Project Studio
Resources
About
Contact

Industrial Zone
Shirokë
23000 Suharekë
Kosovo

Phone
Email

SQ | EN

© Dekorfix
```

Use the actual company information already available from the existing website where appropriate. The current site identifies Dekorfix as a Kosovo manufacturing company located in the Industrial Zone in Shirokë, Suharekë.

Do not invent an email address.

---

# 20. MICRO-INTERACTIONS

Create a subtle interaction language.

Examples:

* Buttons transition smoothly
* Navigation links have restrained hover states
* Cards slightly shift/reveal information
* Images can have subtle scale transitions
* Dropdowns animate smoothly
* Drawers use smooth transitions

Keep animations around 150–350ms where appropriate.

Do not animate everything.

---

# 21. ACCESSIBILITY

The foundation must support:

* Keyboard navigation
* Focus-visible states
* Semantic HTML
* Accessible buttons
* Accessible form controls
* Good contrast
* Reduced-motion support

Do not sacrifice accessibility for visual design.

---

# 22. RESPONSIVE DESIGN

Design from the beginning for:

* Desktop
* Laptop
* Tablet
* Mobile

Do not simply shrink desktop layouts.

Mobile should have its own deliberate composition.

Typography, spacing, navigation and cards should adapt appropriately.

---

# 23. DARK SECTIONS

The site can use occasional dark sections.

Use them strategically for:

* Brand storytelling
* Manufacturing
* Project Studio CTA
* Strong product statements
* Footer

Do not make the entire website dark.

The main website should remain predominantly clean and light.

---

# 24. BRAND EXPERIENCE

The final result should make someone immediately think:

> "This is a serious European materials manufacturer."

It should communicate:

**Dekorfix = quality materials + modern manufacturing + professional solutions**

The website should feel capable of competing visually with established European construction/material brands.

---

# 25. DO NOT BUILD THESE YET

This phase is ONLY the design foundation.

Do NOT build:

* Full homepage
* Product pages
* Project pages
* Solutions pages
* Project Studio
* Three.js scene
* Material calculator
* Admin dashboard
* Authentication
* Backend business logic

Those will be separate phases.

---

# 26. REQUIRED DELIVERABLE

At the end of this phase, the project should have:

### Global design tokens

Colors, typography, spacing, radius, shadows, transitions.

### Global components

Navbar, Footer, Button, Container, Section, Heading, Cards, Forms and other required primitives.

### Global layout

Proper Next.js layout structure.

### Responsive navigation

Desktop + mobile.

### Font system

Configured properly with Next.js font optimization.

### Brand assets

Correct Dekorfix logo usage.

### Visual consistency

All components must feel like one coherent design system.

---

# 27. QUALITY CHECK

Before finishing:

Open the application and inspect it visually.

Do not judge the result only from the code.

Check:

* Typography
* Spacing
* Navbar
* Buttons
* Hover states
* Mobile navigation
* Footer
* Responsive behavior
* Accessibility
* Overall brand feeling

Ask yourself:

> Does this look like a premium European architectural-materials company?

If it looks like a generic Tailwind starter template, improve it.

If it looks like an AI-generated website, improve it.

If it looks like a 2018 construction website, improve it.

The goal is:

**Premium. Modern. Minimal. Architectural. Precise.**

---

# 28. IMPORTANT

Do not change the project's established architecture from Phase 0 unless there is a strong technical reason.

Do not install unnecessary packages.

Do not create fake data throughout the application.

Do not hardcode the Dekorfix brand colors in dozens of components.

Use centralized design tokens.

Do not use excessive `!important`.

Do not create unnecessary abstractions.

Keep the implementation clean and understandable.

When finished, report:

1. Files created/changed
2. Design tokens created
3. Font selected and why
4. Dekorfix brand colors selected
5. Components created
6. Navigation structure
7. Responsive behavior
8. Dependencies added
9. Any issues encountered
10. Recommended next phase

Stop after completing Phase 1.
