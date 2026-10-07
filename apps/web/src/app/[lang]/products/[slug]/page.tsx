import { routes } from "@/config/routes";
import { detailShell } from "@/features/page-shells/detail-shell";

const shell = detailShell({
  item: "product",
  listing: "products",
  listingPath: routes.products,
  itemPath: routes.product,
  notice: "productDetail",
});

export const generateMetadata = shell.generateMetadata;
export default shell.Page;
