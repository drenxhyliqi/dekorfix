import { adminSectionShell } from "@/features/page-shells/admin-shells";

// Orders are already stored by the API (POST /api/v1/orders); listing them here
// arrives with admin authentication, so customer data is never served unprotected.
const shell = adminSectionShell("orders");

export const metadata = shell.metadata;
export default shell.Page;
