import Link from "next/link";

import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-page";
import { adminRoutes } from "@/config/routes";

export default function AdminNotFound() {
  return (
    <>
      <AdminPageHeader title="Faqja nuk u gjet" description="Kjo faqe e administrimit nuk ekziston." />
      <AdminPanel>
        <Link href={adminRoutes.dashboard} className="text-small font-medium text-text underline underline-offset-4">
          Kthehu te paneli
        </Link>
      </AdminPanel>
    </>
  );
}
