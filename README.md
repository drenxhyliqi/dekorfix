# Dekorfix Platform

Monorepo for the rebuilt Dekorfix website and platform, replacing
[dekorfix.net](https://dekorfix.net).

> **Status: Phase 2 (routes + navigation).** Every route exists as a page shell.
> Page content is built phase by phase, starting with the homepage.

## Architecture

```text
Browser ──► Next.js (apps/web) ──HTTP──► FastAPI (apps/api) ──SQLAlchemy──► PostgreSQL
```

| Path              | What                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| `apps/web`        | Next.js 16 (App Router, TypeScript strict, Tailwind CSS 4, ESLint)    |
| `apps/api`        | FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, psycopg 3              |
| `packages/shared` | TypeScript types shared by TS apps (e.g. API response contracts)      |
| `docker/`         | Shared infrastructure config (currently empty)                        |

The web app and the API are independent and can be deployed separately.
Each has its own Dockerfile with `development` and `production` targets.

The backend is layered: **routes** (`app/api/v1`) → **schemas** (`app/schemas`)
→ **services** (`app/services`) → **repositories** (`app/repositories`) → database.
Routes stay thin. Business logic lives in services, and database access lives in repositories.

## Requirements

- Docker with Docker Compose v2
- Node.js ≥ 20.9 (24 recommended) and npm, for running the web app outside Docker
- Python ≥ 3.13 (3.14 used in Docker), for running the API outside Docker

## Local development (Docker)

```bash
cp .env.example .env        # then adjust values if needed
docker compose up --build
```

| URL                                    | Service                                  |
| -------------------------------------- | ---------------------------------------- |
| http://localhost:3000                  | Next.js (status page)                    |
| http://localhost:8000/api/v1/health    | API liveness                             |
| http://localhost:8000/api/v1/health/db | API readiness (checks PostgreSQL)        |
| http://localhost:8000/docs             | OpenAPI docs (disabled in production)    |
| localhost:5433                         | PostgreSQL (from your machine)           |

Host ports come from `WEB_PORT`, `API_PORT` and `POSTGRES_PORT` in `.env`. If you
change `API_PORT`, update `NEXT_PUBLIC_API_URL` to match. If you change `WEB_PORT`,
update `CORS_ORIGINS` to match.

Source code is bind-mounted, so both apps hot-reload. The API container runs
`alembic upgrade head` on startup. PostgreSQL data lives in the
`dekorfix_postgres_data` named volume and survives `docker compose down`
(`docker compose down -v` deletes it).

## Routes

Public pages are localized (`/sq/...`, `/en/...`). A locale-less URL redirects
to the visitor's preferred language. All paths live in `src/config/routes.ts`.

```text
/[lang]                      home
/[lang]/products             catalog (category filter: ?category=adhesives)
/[lang]/products/[slug]      product
/[lang]/solutions            /solutions/[slug]
/[lang]/projects             /projects/[slug]
/[lang]/project-studio       /calculator
/[lang]/resources            /resources/[slug]
/[lang]/about  /contact  /request-quote  /search
/[lang]/privacy  /terms  /cookies
/[lang]/design-system        internal component reference (noindex)

/admin                       dashboard (separate root layout, not localized, noindex)
/admin/products[/id]  /admin/categories  /admin/solutions[/id]  /admin/projects[/id]
/admin/resources[/id] /admin/calculator  /admin/quotes  /admin/contacts
/admin/users  /admin/settings
```

**Admin access:** there is no authentication yet, so `/admin` is not linked
from the public site. `src/proxy.ts` allows it in development and returns 404
in production unless `ADMIN_PREVIEW=true`. Replace that check with a session
check when admin login is built.

## Web app structure & design system

```text
apps/web/src/
├── app/[lang]/          # every route is localized: /sq (default), /en
├── app/globals.css      # ALL design tokens (Tailwind 4 @theme)
├── components/
│   ├── brand/           # Logo (vector, light/inverse)
│   ├── ui/              # Button, Container, Section, Typography, Badge, Breadcrumbs,
│   │                    # Media, Tabs, Modal/Drawer (native <dialog>)
│   ├── forms/           # Field, Input, Select, Textarea, Checkbox/Radio, FormSection
│   ├── cards/           # Product, Project, Resource, Solution, Feature cards
│   └── layout/          # Navbar (+ mega menu, mobile nav), Footer, Hero, PageHeader
├── config/              # navigation (IA) and company facts
├── i18n/                # locales, dictionaries (sq, en), getDictionary()
└── proxy.ts             # redirects locale-less URLs to /sq or /en
```

- **Tokens:** colours, type scale, spacing, radius, shadows and motion are defined
  once in `globals.css`. Use semantic utilities (`bg-surface-muted`,
  `text-text-secondary`, `border-border-strong`, `text-h2`, `py-section`) and never
  hard-code hex values. Dark sections set `data-tone="dark"`, which re-maps the
  same tokens.
- **Brand:** Dekorfix red `#E41E25` is sampled from the official logo
  (`public/brand/dekorfix-logo.png`). Use it as an accent only.
- **Type:** Geist (variable, Latin Extended for Albanian) via `next/font`.
- **Icons:** `lucide-react` only.
- **Images:** source files live in `dekorfix_assets/`. Run
  `python3 scripts/prepare_images.py` (needs Pillow) to regenerate the optimised
  WebP files in `apps/web/public/images/`.
- **Content:** real product names and descriptors used by the site are in
  `src/content/products.ts`, until the catalog moves to the API.
- **Reference:** open `/sq/design-system` (not indexed) to see every token and
  component.
- **Copy:** UI strings live in `src/i18n/dictionaries/{sq,en}.ts`. The English
  dictionary defines the type, so a missing Albanian key fails the typecheck.

## Running apps outside Docker

Start only the database with `docker compose up postgres`, then:

```bash
# API
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload            # http://localhost:8000

# Web (from the repository root)
npm install
npm run dev:web                          # http://localhost:3000
```

Outside Docker, the API reads the repository-root `.env`.

## Database migrations (Alembic)

Run these from `apps/api`, or prefix them with `docker compose exec api`:

```bash
alembic revision --autogenerate -m "add products"   # after adding/changing models
alembic upgrade head
alembic downgrade -1
alembic current
alembic check                                       # fails if models and migrations differ
```

To add a model, create it in `app/models/`, subclass `app.models.base.Base`, and import
it in `app/models/__init__.py` so autogenerate can see it. A shared naming
convention gives constraints deterministic names. New revision files are
auto-formatted with ruff.

In production, run `alembic upgrade head` as a release step. The production
API image does not migrate on startup.

## Environment variables

Copy `.env.example` to `.env`. `.env` is git-ignored and must never be committed.

| Variable                                     | Used by          | Notes                                                                 |
| -------------------------------------------- | ---------------- | --------------------------------------------------------------------- |
| `ENVIRONMENT`                                | API              | `development`, `test` or `production`. Production disables docs and rejects `*` CORS. |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Postgres, API | Database credentials                                         |
| `POSTGRES_HOST`, `POSTGRES_PORT`             | API, Compose     | DB address from your machine. Compose overrides the host inside Docker. |
| `DATABASE_URL`                               | API              | Optional full URL. Overrides the `POSTGRES_*` parts when set.         |
| `CORS_ORIGINS`                               | API              | Comma-separated browser origins allowed to call the API               |
| `API_PORT`, `WEB_PORT`                       | Compose          | Published host ports                                                  |
| `NEXT_PUBLIC_API_URL`                        | Web              | API URL used by the browser. Inlined at **build** time, so never put secrets here. |
| `API_INTERNAL_URL`                           | Web (server)     | API URL used by the Next.js server. Set by Compose to `http://api:8000`. |
| `SITE_URL`                                   | Web (server)     | Public origin for canonical and Open Graph URLs.                       |
| `ADMIN_PREVIEW`                              | Web (server)     | `true` opens `/admin` in production builds. Temporary, until admin auth exists. |

## Quality checks

```bash
# Web (from the repository root)
npm run lint
npm run typecheck
npm test          # Project Studio calculations (node --test, no extra deps)

# API (from apps/api)
pytest
ruff check . && ruff format --check .
```

## Production images

```bash
docker build -f apps/web/Dockerfile --target production \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t dekorfix-web .
docker build --target production -t dekorfix-api apps/api
```
