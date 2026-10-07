# syntax=docker/dockerfile:1
# Build context: the repository root (needed for the npm workspace).
#   docker build -f apps/web/Dockerfile --target production .

FROM node:24-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app


FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN npm ci


# Development: source bind-mounted by docker-compose, hot reload.
FROM deps AS development
COPY apps/web apps/web
COPY packages/shared packages/shared
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]


FROM deps AS builder
COPY apps/web apps/web
COPY packages/shared packages/shared
# Inlined into the browser bundle at build time.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build -w web


# Production: standalone server output only, non-root user.
FROM base AS production
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
