import type { ReactNode } from "react";

import { Section } from "@/components/ui/section";

import { PlaceholderNotice } from "./placeholder-notice";

/** Header plus an "in development" notice: the temporary body of every page until it is built. */
export function PageShell({
  header,
  noticeLabel,
  notice,
}: {
  /** Usually a <PageHeader />; may be wrapped in <Suspense> for dynamic routes. */
  header: ReactNode;
  noticeLabel: string;
  notice: string;
}) {
  return (
    <>
      {header}
      <Section spacing="compact">
        <PlaceholderNotice label={noticeLabel}>{notice}</PlaceholderNotice>
      </Section>
    </>
  );
}
