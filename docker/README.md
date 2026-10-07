# docker/

Shared infrastructure configuration that does not belong to a single app,
for example PostgreSQL init scripts or a reverse proxy config.

Empty in Phase 0. Per-app Dockerfiles live next to their app:

- `apps/api/Dockerfile`: FastAPI (`development` and `production` targets)
- `apps/web/Dockerfile`: Next.js (`development` and `production` targets, built from the repository root)
