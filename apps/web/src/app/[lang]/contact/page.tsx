import { routes } from "@/config/routes";
import { staticShell } from "@/features/page-shells/static-shell";

const shell = staticShell("contact", routes.contact);

export const generateMetadata = shell.generateMetadata;
export default shell.Page;
