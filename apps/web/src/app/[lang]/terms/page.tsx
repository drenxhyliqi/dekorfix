import { routes } from "@/config/routes";
import { staticShell } from "@/features/page-shells/static-shell";

const shell = staticShell("terms", routes.terms, "legal");

export const generateMetadata = shell.generateMetadata;
export default shell.Page;
