"use client";

import { useEffect, useState } from "react";

import { checkServices, type ServiceChecks } from "./check-services";
import { StatusList } from "./status-list";

/** Checks the API from the browser, which also exercises CORS. */
export function ClientStatus() {
  const [checks, setChecks] = useState<ServiceChecks | null>(null);

  useEffect(() => {
    let cancelled = false;
    void checkServices().then((result) => {
      if (!cancelled) setChecks(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <StatusList checks={checks} />;
}
