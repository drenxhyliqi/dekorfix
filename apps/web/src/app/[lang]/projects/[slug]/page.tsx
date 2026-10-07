import { routes } from "@/config/routes";
import { detailShell } from "@/features/page-shells/detail-shell";

const shell = detailShell({
  item: "project",
  listing: "projects",
  listingPath: routes.projects,
  itemPath: routes.project,
  notice: "projectDetail",
});

export const generateMetadata = shell.generateMetadata;
export default shell.Page;
