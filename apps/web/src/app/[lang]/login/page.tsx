import { routes } from "@/config/routes";
import { staticShell } from "@/features/page-shells/static-shell";

const shell = staticShell("login", routes.login, "login");

export const generateMetadata = shell.generateMetadata;
export default shell.Page;
