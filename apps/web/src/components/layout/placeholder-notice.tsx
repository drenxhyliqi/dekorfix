import { Badge } from "@/components/ui/badge";

/** Marks a page area whose real content arrives in a later phase. */
export function PlaceholderNotice({ label, children }: { label: string; children: string }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xs border border-dashed border-border-strong p-6 sm:flex-row sm:items-center sm:gap-6 md:p-8">
      <Badge variant="outline">{label}</Badge>
      <p className="text-body text-text-secondary">{children}</p>
    </div>
  );
}
