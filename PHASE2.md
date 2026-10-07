# DEKORFIX — PHASE 2

## Complete Route Structure + Global Navigation

The Dekorfix project foundation and global design system have already been created.

Before building individual pages, we now need to establish the **complete website route structure and global navigation**.

The goal of this phase is to make the entire website navigable from beginning to end.

IMPORTANT:

**Do NOT build the actual content/design of the individual pages yet.**

Create the routes, page shells, navigation, footer, breadcrumbs where appropriate, and placeholder states only.

After this phase, we will build the pages one by one, starting with the Homepage.

---

# 1. FIRST — INSPECT THE CURRENT PROJECT

Before making changes:

1. Read the existing project structure.
2. Read the existing design system from Phase 1.
3. Identify the existing Navbar.
4. Identify the existing Footer.
5. Identify the existing Container/Section components.
6. Identify the current Next.js routing structure.
7. Check whether internationalization already exists.
8. Check the existing assets and logo.
9. Do not recreate components that already exist.
10. Reuse the established design system.

Do not change the architecture unnecessarily.

---

# 2. WEBSITE INFORMATION ARCHITECTURE

Create the following public route structure.

## Main Pages

### Homepage

```text
/
```

---

### Products

```text
/products
```

Product listing/catalog page.

Dynamic product page:

```text
/products/[slug]
```

Example:

```text
/products/dekorfix-product-name
```

Do NOT create real product content yet.

---

### Solutions

```text
/solutions
```

Dynamic solution:

```text
/solutions/[slug]
```

---

### Projects

```text
/projects
```

Dynamic project:

```text
/projects/[slug]
```

---

### Project Studio

```text
/project-studio
```

This will eventually contain the React Three Fiber + Three.js interactive room/project configurator.

For now create only the page shell.

DO NOT build the 3D configurator in this phase.

---

### Calculator

```text
/calculator
```

This will eventually contain the standalone material calculator.

For now create only the page shell.

---

### Resources

```text
/resources
```

Dynamic resource:

```text
/resources/[slug]
```

Resources may eventually contain:

* Technical documents
* Product catalogues
* Certificates
* Guides
* Data sheets
* Safety documents

Do not implement the actual resource system yet.

---

### About

```text
/about
```

---

### Contact

```text
/contact
```

---

### Request Quote

```text
/request-quote
```

---

### Search

```text
/search
```

Create the route and basic page shell.

Do not implement full search functionality yet.

---

# 3. LEGAL / SYSTEM ROUTES

Create:

```text
/privacy
/terms
/cookies
```

Also create:

```text
/not-found
```

or the appropriate Next.js `not-found.tsx`.

Create a professional branded 404 experience.

---

# 4. ADMIN ROUTE STRUCTURE

Create a completely separate admin area.

Base route:

```text
/admin
```

Admin pages:

```text
/admin
/admin/products
/admin/products/[id]

/admin/categories

/admin/solutions
/admin/solutions/[id]

/admin/projects
/admin/projects/[id]

/admin/resources
/admin/resources/[id]

/admin/calculator

/admin/quotes
/admin/contacts

/admin/users
/admin/settings
```

Do not build the admin functionality yet.

For now:

* Create route structure
* Create basic page shells
* Create an AdminLayout
* Create admin navigation
* Create placeholder content

The admin should have its own visual system while still clearly belonging to Dekorfix.

---

# 5. IMPORTANT — ADMIN SHOULD NOT BE A PUBLIC NAVIGATION ITEM

Do NOT put a large:

> Admin Dashboard

button in the main public navbar.

The public website should remain clean.

Instead, prepare an unobtrusive admin entry mechanism.

If authentication already exists:

* Show the admin entry only to authenticated administrators.

If authentication does not exist yet:

* Do not expose a prominent admin link to normal visitors.
* A temporary development-only access mechanism is acceptable if needed.

The eventual production flow will be:

```text
Admin Login
     ↓
/admin
```

---

# 6. GLOBAL NAVIGATION

Now establish the final public Navbar structure.

Desktop navigation should approximately be:

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

Adapt the exact structure to the design system already established.

Do not overcrowd the navbar.

---

# 7. PRODUCTS NAVIGATION

Products should have a dropdown or mega-menu.

Use the real Dekorfix product categories already available from the existing website as the starting content reference.

Do not invent categories if the actual Dekorfix category structure is available.

The dropdown should eventually support:

```text
Products

Categories
──────────────

Adhesives
Facades
Primers / Bases
Paints
Plasters / Levelers

──────────────

View All Products →
```

The actual categories should be verified against the existing Dekorfix content.

For now, navigation links may point to:

```text
/products
```

until individual category routes are defined later.

---

# 8. SOLUTIONS NAVIGATION

Create a clean dropdown if appropriate.

Potential structure:

```text
Solutions

Interior
Exterior
Facade Systems
Insulation
Finishing

View All Solutions →
```

Do not invent final Dekorfix solutions.

Use placeholders until the content architecture is finalized.

---

# 9. PROJECT STUDIO CTA

Project Studio should receive stronger visual emphasis than a normal navigation item because it will become one of the site's main differentiators.

For example:

```text
Project Studio
```

with a subtle accent treatment.

Do NOT make it look like a generic bright SaaS button.

It should still fit the premium Dekorfix navigation.

---

# 10. REQUEST QUOTE CTA

The Navbar may include a compact CTA:

```text
Request a Quote
```

This should use the Dekorfix accent color or the established primary CTA style.

Keep it visually balanced.

Do not create an oversized pill button.

---

# 11. LANGUAGE SWITCHER

Prepare the Navbar for:

```text
SQ
EN
```

If internationalization already exists in the project, integrate it properly.

If it does not exist yet:

* Create the UI structure
* Do not implement a fake language switcher
* Do not duplicate the entire application manually

Use the project's established i18n architecture when it is implemented.

The eventual structure should support:

```text
/sq
/en
```

if that is consistent with the architecture established earlier.

Do not break the existing routing architecture just to implement this.

---

# 12. MOBILE NAVIGATION

Create the complete mobile navigation.

It should contain:

```text
Products
Solutions
Projects
Project Studio
Resources
About
Contact

Request a Quote

SQ | EN
```

Products and Solutions should be expandable sections.

Use a proper mobile drawer.

The drawer should feel premium and deliberate.

Avoid a generic template hamburger menu.

---

# 13. FOOTER NAVIGATION

Update the Footer with all major destinations.

Suggested structure:

```text
DEKORFIX

Products
Solutions
Projects
Project Studio
Resources
About
Contact

Request a Quote

Privacy
Terms
Cookies

SQ | EN
```

Use actual company information from the existing Dekorfix website where available.

Do not invent contact information.

---

# 14. PAGE SHELLS

Every route should render successfully.

For example:

```text
/products
```

should currently show something like:

```text
Products

Explore Dekorfix products and solutions.

[Page content coming in next phase]
```

This is ONLY a placeholder.

The visual treatment should still use:

* Correct typography
* Correct spacing
* Correct container
* Correct Navbar
* Correct Footer
* Correct brand colors

Do not create elaborate placeholder designs.

---

# 15. DYNAMIC ROUTES

For dynamic routes such as:

```text
/products/[slug]
/solutions/[slug]
/projects/[slug]
/resources/[slug]
```

Create a simple development fallback.

For example:

```text
Product

Product details will be implemented in the Product Detail phase.
```

Make sure the route architecture is correct and ready for future backend data.

Do not hardcode fake product content.

---

# 16. BREADCRUMBS

Prepare a reusable Breadcrumb component.

Example:

```text
Home / Products / Product Name
```

It should eventually work dynamically.

Use it on:

* Product Detail
* Solution Detail
* Project Detail
* Resource Detail

Do not necessarily show breadcrumbs on the homepage.

---

# 17. PAGE TITLE / METADATA FOUNDATION

Prepare basic metadata architecture for each route.

Each page should eventually be able to define:

```text
title
description
openGraph
canonical
```

For this phase, use reasonable temporary values.

Do not spend time on final SEO copy yet.

That will be handled after the actual page content is built.

---

# 18. ROUTE CONSTANTS

Do not scatter raw URLs throughout components.

Create a centralized route configuration if appropriate.

For example:

```ts
routes.products
routes.solutions
routes.projects
routes.projectStudio
routes.calculator
routes.resources
routes.about
routes.contact
routes.requestQuote
```

Use the project's existing conventions if a route utility already exists.

---

# 19. ACTIVE NAVIGATION

The Navbar must correctly identify the current page.

For example:

```text
Products
```

should be active on:

```text
/products
/products/[slug]
```

Similarly:

```text
Projects
```

should be active on:

```text
/projects
/projects/[slug]
```

Project Studio should be independently active.

Use subtle visual indicators rather than heavy backgrounds.

---

# 20. ADMIN LAYOUT

Create:

```text
AdminLayout
```

with a sidebar.

Example:

```text
┌──────────────────────────────────────────────┐
│ DEKORFIX ADMIN                               │
├──────────────┬───────────────────────────────┤
│              │                               │
│ Dashboard    │                               │
│ Products     │                               │
│ Categories   │                               │
│ Solutions    │                               │
│ Projects     │                               │
│ Resources    │                               │
│ Calculator   │                               │
│ Quotes       │                               │
│ Contacts     │                               │
│ Users        │                               │
│ Settings     │                               │
│              │                               │
└──────────────┴───────────────────────────────┘
```

Make it clean and professional.

Do NOT build CRUD functionality yet.

---

# 21. ADMIN ICON

Prepare an admin icon/access point without making it prominent on the public website.

If there is already an authenticated user system:

```text
Admin / Dashboard
```

can appear in an authenticated user menu.

If there is no authentication yet, leave the admin entry available only through the `/admin` development route.

Do not put a large dashboard icon in the public hero or navbar.

---

# 22. ROUTE TREE

At the end of this phase, the project should conceptually look like:

```text
/
├── products
│   └── [slug]
│
├── solutions
│   └── [slug]
│
├── projects
│   └── [slug]
│
├── project-studio
│
├── calculator
│
├── resources
│   └── [slug]
│
├── about
├── contact
├── request-quote
├── search
│
├── privacy
├── terms
├── cookies
│
└── admin
    ├── products
    │   └── [id]
    ├── categories
    ├── solutions
    │   └── [id]
    ├── projects
    │   └── [id]
    ├── resources
    │   └── [id]
    ├── calculator
    ├── quotes
    ├── contacts
    ├── users
    └── settings
```

---

# 23. DO NOT BUILD PAGE CONTENT YET

This is critical.

Do NOT start designing:

* Homepage sections
* Product grids
* Product detail content
* Project galleries
* Solution content
* About story
* Calculator UI
* Project Studio UI
* Three.js scene
* Admin CRUD
* Forms
* Backend business logic

Those will be implemented individually.

This phase is about **navigation + architecture + page shells**.

---

# 24. NEXT DEVELOPMENT ORDER

Once this phase is completed, we will build the website sequentially:

### Phase 3

**Homepage**

Build the complete homepage from top to bottom.

### Phase 4

**Products**

Products listing/catalog.

### Phase 5

**Product Detail**

Full product experience.

### Phase 6

**Solutions**

Solutions listing + detail.

### Phase 7

**Projects**

Projects listing + detail.

### Phase 8

**Project Studio**

React Three Fiber + Three.js interactive room configurator.

### Phase 9

**Calculator**

Standalone material calculator + Project Studio integration.

### Phase 10

**Resources**

Documents, technical resources, catalogues.

### Phase 11

**About**

Company/manufacturing story.

### Phase 12

**Contact + Quote Request**

Forms + backend integration.

### Phase 13

**Admin Dashboard**

Products, projects, resources, calculator rules, quotes, etc.

### Phase 14

**SEO + Performance + QA**

Final optimization and production preparation.

---

# 25. FINAL VERIFICATION

Before finishing this phase, navigate through every route.

Verify:

* No broken routes
* No console errors
* Navbar works
* Mobile menu works
* Dropdowns work
* Footer links work
* Dynamic routes work
* 404 works
* Admin layout works
* Active navigation works
* Language UI does not break routing
* Responsive layouts work

Then inspect the entire site visually.

The website should now feel like **one coherent Dekorfix product**, even though the individual pages are still placeholders.

---

# FINAL OUTPUT

When finished, report:

1. Complete route tree
2. Public routes created
3. Admin routes created
4. Navbar implementation
5. Mobile navigation
6. Footer implementation
7. Dropdown/mega-menu implementation
8. Admin access approach
9. Dynamic route structure
10. Components created/modified
11. Any issues
12. Confirmation that every route was tested

Then STOP.

Do not start building the Homepage.

The next prompt after this phase will specifically say:

**"Now build the Dekorfix Homepage from top to bottom."**
