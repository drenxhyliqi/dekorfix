# Dekorfix — Phase 0: Project Foundation

You are working as a senior full-stack engineer and software architect.

We are rebuilding the **Dekorfix** website as a production-ready digital platform.

The final platform will eventually include:

* Premium marketing website
* Product catalog
* Product detail pages
* Solutions / construction systems
* Projects / portfolio
* Resources and technical documents
* Interactive wall/project calculator
* Visual 2D wall editor
* Later, optional 3D visualization
* Product recommendations
* Estimated material quantities and pricing
* Quote/request system
* Admin dashboard
* Product/content management
* Analytics
* Albanian + English localization

However, **DO NOT build any of those features during Phase 0.**

Your job in this phase is ONLY to establish a clean, scalable, production-ready project foundation.

---

# 1. Technology Stack

Use:

## Frontend

* Next.js
* TypeScript
* App Router
* Strict TypeScript
* ESLint
* Tailwind CSS
* Modern CSS where appropriate

## Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy 2.x
* Alembic

## Database

* PostgreSQL

## Infrastructure

* Docker
* Docker Compose

The architecture must allow the frontend and backend to be developed and deployed independently.

---

# 2. Repository Structure

Create a monorepo with this general structure:

```text
dekorfix/
│
├── apps/
│   ├── web/
│   │
│   └── api/
│
├── packages/
│   └── shared/
│
├── docker/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

Frontend:

```text
apps/web/
```

Backend:

```text
apps/api/
```

Do not unnecessarily create additional applications or packages.

Keep the architecture simple and understandable.

---

# 3. Frontend Foundation

Set up the Next.js application using:

* App Router
* TypeScript
* strict mode
* ESLint
* Tailwind CSS

Use a clean `src` architecture.

Something along these lines:

```text
apps/web/
├── public/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── stores/
│   ├── types/
│   └── config/
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── ...
```

Do not create unnecessary abstractions.

The project should remain easy for another developer to understand.

---

# 4. Backend Foundation

Create a clean FastAPI architecture.

Use:

```text
apps/api/
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── dependencies.py
│   │
│   ├── api/
│   │   └── v1/
│   │       └── router.py
│   │
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   └── utils/
│
├── migrations/
├── tests/
├── requirements.txt
└── Dockerfile
```

Use a clear separation between:

```text
API routes
↓
schemas
↓
services
↓
repositories
↓
database
```

Do not put business logic directly inside route handlers.

---

# 5. PostgreSQL

Configure PostgreSQL through Docker Compose.

Use environment variables for:

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_HOST
POSTGRES_PORT
DATABASE_URL
```

Do not hardcode credentials.

Create:

```text
.env.example
```

with safe placeholder values.

Never commit a real `.env`.

---

# 6. SQLAlchemy

Use SQLAlchemy 2.x style.

Create the database engine/session infrastructure.

Prepare the project for models and migrations, but **do not create the final Dekorfix business models yet.**

Do NOT create:

* Product model
* Project model
* Calculator model
* Quote model
* User model
* etc.

Those belong to later phases.

Only establish the infrastructure necessary for those models.

---

# 7. Alembic

Configure Alembic correctly.

The following should work:

```bash
alembic revision --autogenerate -m "..."
alembic upgrade head
alembic downgrade -1
```

Make sure Alembic can access the SQLAlchemy metadata correctly.

The database should be reproducible from migrations.

---

# 8. Docker

Create a development-ready:

```text
docker-compose.yml
```

Initially include:

```text
postgres
api
web
```

Each service should have its own Dockerfile where appropriate.

Use named volumes for PostgreSQL persistence.

Example architecture:

```text
                ┌──────────────┐
                │   Next.js    │
                │      web     │
                └──────┬───────┘
                       │
                       │ HTTP
                       ↓
                ┌──────────────┐
                │   FastAPI    │
                │      api     │
                └──────┬───────┘
                       │
                       │ SQLAlchemy
                       ↓
                ┌──────────────┐
                │ PostgreSQL   │
                └──────────────┘
```

Do not introduce Redis, Celery, Kubernetes, microservices, or other infrastructure unless there is a concrete reason.

Keep the initial architecture intentionally simple.

---

# 9. Environment Configuration

Frontend and backend must use environment variables.

Frontend example:

```text
NEXT_PUBLIC_API_URL=
```

Backend example:

```text
DATABASE_URL=
CORS_ORIGINS=
ENVIRONMENT=
```

Create appropriate configuration classes.

The backend should have separate development/production-safe configuration behavior.

Do not expose secrets to the frontend.

---

# 10. CORS

Configure FastAPI CORS properly for local development.

Allow the local Next.js development server.

Do not use:

```python
allow_origins=["*"]
```

as the permanent configuration.

Use environment-based origins.

---

# 11. API Versioning

Prepare the backend for:

```text
/api/v1/
```

Create a root router.

For now, implement only a simple health endpoint:

```text
GET /api/v1/health
```

Response:

```json
{
  "status": "ok"
}
```

Keep this endpoint extremely simple.

---

# 12. Frontend ↔ Backend Connection

Create a minimal API client abstraction in Next.js.

For example:

```text
src/lib/api/
```

The frontend should be able to call:

```text
GET /api/v1/health
```

through the API client.

Do not build a complicated data-fetching abstraction yet.

Do not add React Query/TanStack Query unless there is a concrete reason to establish it now.

---

# 13. TypeScript Configuration

Use strict TypeScript.

Avoid:

```typescript
any
```

unless there is a legitimate technical reason.

Do not disable strict checks just to make the project compile.

---

# 14. Code Quality

Establish basic quality rules.

Frontend:

* ESLint
* TypeScript strict mode
* consistent import structure
* no unused variables
* no unnecessary `any`

Backend:

* clean imports
* type hints
* Pydantic validation
* clear module boundaries

Do not over-engineer.

The objective is a clean foundation, not a massive enterprise architecture.

---

# 15. Git Configuration

Create a proper `.gitignore`.

It must exclude:

```text
.env
.env.local
__pycache__
.pytest_cache
node_modules
.next
dist
build
*.pyc
Docker volumes
IDE files
OS files
```

Do not accidentally commit:

* credentials
* database files
* node_modules
* build output

---

# 16. README

Create a useful root README.

It should explain:

```text
Dekorfix Platform
```

Then:

### Architecture

Explain:

```text
Next.js → FastAPI → PostgreSQL
```

### Requirements

List:

* Node.js
* Python
* Docker
* Docker Compose

### Local development

Explain how to start the project.

For example:

```bash
docker compose up --build
```

Then explain the expected local URLs.

### Backend

Explain how to run migrations.

### Environment variables

Explain how `.env.example` should be copied/configured.

Keep this documentation concise and accurate.

---

# 17. Testing Foundation

Do not write extensive tests yet.

Only establish the testing infrastructure.

Backend should be prepared for:

```text
pytest
```

Create one simple health endpoint test.

Frontend does not need a large testing setup during Phase 0 unless the chosen Next.js setup already provides one naturally.

Do not spend time writing feature tests for functionality that doesn't exist yet.

---

# 18. Important Architecture Rule

The eventual calculator is a major part of this project.

Keep the architecture capable of supporting a domain such as:

```text
Project
 ├── Walls
 │    ├── dimensions
 │    ├── sections
 │    ├── openings
 │    └── products
 │
 └── Calculations
```

But **DO NOT implement this domain yet.**

Phase 0 should only ensure that the architecture will not prevent us from implementing it later.

---

# 19. Do Not Build These Yet

This is extremely important.

During Phase 0, DO NOT create:

* Homepage
* Navbar
* Footer
* Product pages
* Product database
* Calculator
* Wall editor
* 3D editor
* Quote system
* Admin dashboard
* Authentication UI
* CMS
* Animations
* GSAP
* Three.js
* Product recommendation engine
* Pricing engine
* CRM
* Analytics
* Contact forms

We will implement these in later phases.

---

# 20. Do Not Invent Business Data

Do not invent:

* Dekorfix products
* product prices
* product specifications
* company information
* product consumption values
* colors
* technical data
* certifications

Those will be provided/implemented later.

---

# 21. Development Experience

The project should work cleanly for:

```bash
docker compose up --build
```

and the developer should be able to verify:

```text
Next.js → loads
FastAPI → loads
PostgreSQL → connects
Alembic → works
Next.js → FastAPI works
FastAPI → PostgreSQL works
Health endpoint → returns 200
```

---

# 22. Final Verification

Before considering Phase 0 complete, verify all of the following:

### Frontend

* Next.js starts
* TypeScript compiles
* ESLint works
* App Router works

### Backend

* FastAPI starts
* `/api/v1/health` works
* Pydantic configuration works
* SQLAlchemy connects

### Database

* PostgreSQL starts
* connection works
* Alembic works

### Docker

* all services start
* services can communicate
* PostgreSQL data persists after container restart

### Integration

Verify:

```text
Browser
   ↓
Next.js
   ↓
FastAPI
   ↓
PostgreSQL
```

works correctly.

---

# 23. Before Writing Code

First inspect the repository.

If there is already an existing project:

* inspect it
* understand what exists
* do not blindly overwrite files
* preserve anything that is intentionally already configured

If this is an empty repository, initialize the architecture from scratch.

Do not ask unnecessary questions if the requirements above are sufficient.

Make sensible engineering decisions and document them.

---

# 24. Completion Report

When Phase 0 is complete, provide a concise report containing:

1. Final project structure
2. Technologies installed
3. Docker services
4. Environment variables
5. How to run the project
6. Health endpoint
7. Database/migration setup
8. Tests executed
9. Any architectural decisions you made
10. Any issues that remain

Do not start Phase 1 automatically.

**Stop after Phase 0.**

The next phase will be the design system and visual architecture for the Dekorfix website.
