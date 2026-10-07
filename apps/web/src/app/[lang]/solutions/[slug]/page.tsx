import { routes } from "@/config/routes";
import { detailShell } from "@/features/page-shells/detail-shell";

const shell = detailShell({
  item: "solution",
  listing: "solutions",
  listingPath: routes.solutions,
  itemPath: routes.solution,
  notice: "solutionDetail",
});

export const generateMetadata = shell.generateMetadata;
export default shell.Page;
