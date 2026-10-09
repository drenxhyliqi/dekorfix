import { LogOut } from "lucide-react";
import { cookies } from "next/headers";

import { signOut } from "@/features/admin-auth/actions";
import { ADMIN_COOKIE, userForToken } from "@/features/admin-auth/session";

/** The signed-in admin, top right: initials, name and a sign-out button. */
export async function AdminAccount() {
  const user = await userForToken((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!user) return null;
  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="inline-flex size-9 items-center justify-center rounded-full bg-brand text-small font-semibold text-white">
        {initials}
      </span>
      <span className="hidden min-w-0 md:block">
        <span className="block truncate text-small font-medium text-text">{user.name}</span>
        <span className="block truncate text-caption text-text-tertiary">{user.email}</span>
      </span>
      <form action={signOut}>
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-3 text-small font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
        >
          <LogOut aria-hidden className="size-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">Dil</span>
          <span className="sr-only sm:hidden">Dil</span>
        </button>
      </form>
    </div>
  );
}
