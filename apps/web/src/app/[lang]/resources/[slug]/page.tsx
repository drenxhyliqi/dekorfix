import { routes } from "@/config/routes";
import { detailShell } from "@/features/page-shells/detail-shell";

const shell = detailShell({
  item: "resource",
  listing: "resources",
  listingPath: routes.resources,
  itemPath: routes.resource,
  notice: "resourceDetail",
});

export const generateMetadata = shell.generateMetadata;
export default shell.Page;
