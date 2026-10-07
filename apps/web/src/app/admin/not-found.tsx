import Link from "next/link";

import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-page";
import { adminRoutes } from "@/config/routes";

export default function AdminNotFound() {
  return (
    <>
      <AdminPageHeader title="Page not found" description="This admin page does not exist." />
      <AdminPanel>
        <Link href={adminRoutes.dashboard} className="text-small font-medium text-text underline underline-offset-4">
          Back to dashboard
        </Link>
      </AdminPanel>
    </>
  );
}
