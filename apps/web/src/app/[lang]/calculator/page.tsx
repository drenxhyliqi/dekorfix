import { routes } from "@/config/routes";
import { staticShell } from "@/features/page-shells/static-shell";

const shell = staticShell("calculator", routes.calculator);

export const generateMetadata = shell.generateMetadata;
export default shell.Page;
