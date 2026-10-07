/**
 * Response contracts for the API health endpoints.
 * Keep these in sync with `apps/api/app/schemas/health.py`.
 */

/** `GET /api/v1/health`: liveness, no dependencies checked. */
export interface HealthResponse {
  status: "ok";
}

/** `GET /api/v1/health/db`: readiness, verifies the database connection. */
export interface DatabaseHealthResponse {
  status: "ok" | "error";
  database: "ok" | "unavailable";
}
