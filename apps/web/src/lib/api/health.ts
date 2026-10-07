import type {
  DatabaseHealthResponse,
  HealthResponse,
} from "@dekorfix/shared";

import { apiRequest } from "./client";

export function getHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>("/api/v1/health", { cache: "no-store" });
}

export function getDatabaseHealth(): Promise<DatabaseHealthResponse> {
  return apiRequest<DatabaseHealthResponse>("/api/v1/health/db", {
    cache: "no-store",
  });
}
