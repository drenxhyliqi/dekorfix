import { Suspense } from "react";

import { AdminAccount } from "@/components/admin/admin-account";
import { AdminShell } from "@/components/admin/admin-shell";

/** The admin panel's chrome: sidebar, top bar with the signed-in account. */
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell
      account={
        <Suspense fallback={null}>
          <AdminAccount />
        </Suspense>
      }
    >
      {children}
    </AdminShell>
  );
}
