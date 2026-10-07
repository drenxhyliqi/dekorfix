import { connection } from "next/server";

import { checkServices } from "./check-services";
import { StatusList } from "./status-list";

/** Checks the API from the Next.js server (container → container). */
export async function ServerStatus() {
  // Run at request time rather than during the build-time prerender.
  await connection();
  const checks = await checkServices();
  return <StatusList checks={checks} />;
}
