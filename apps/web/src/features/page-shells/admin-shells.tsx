import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminModulePlaceholder, AdminPageHeader } from "@/components/admin/admin-page";
import { Badge } from "@/components/ui/badge";
import { adminSections, type AdminSectionKey } from "@/config/admin-navigation";

/** Placeholder list page for an admin module. */
export function adminSectionShell(key: Exclude<AdminSectionKey, "dashboard">) {
  const section = adminSections[key];
  const metadata: Metadata = { title: section.label };

  function Page() {
    return (
      <>
        <AdminPageHeader title={section.label} description={section.description} />
        <AdminModulePlaceholder module={section.label} />
      </>
    );
  }

  return { metadata, Page };
}

type IdParams = Promise<{ id: string }>;

/** Placeholder edit page for a single admin record. */
export function adminDetailShell(key: "products" | "solutions" | "projects" | "resources") {
  const section = adminSections[key];
  const item = section.item ?? "item";
  const metadata: Metadata = { title: `Edit ${item}` };

  function Page({ params }: { params: IdParams }) {
    return (
      <>
        <AdminPageHeader
          title={`Edit ${item}`}
          description={section.description}
          meta={
            <Suspense fallback={<Badge variant="outline">ID …</Badge>}>
              <RecordId params={params} />
            </Suspense>
          }
        />
        <AdminModulePlaceholder module={section.label} />
      </>
    );
  }

  return { metadata, Page };
}

async function RecordId({ params }: { params: IdParams }) {
  const { id } = await params;
  return <Badge variant="outline">ID {decodeURIComponent(id)}</Badge>;
}
