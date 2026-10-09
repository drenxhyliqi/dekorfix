import { productCategories } from "@/config/navigation";
import { routes } from "@/config/routes";
import { company } from "@/config/site";
import { distanceKm, exportCities, exportCountries, factory } from "@/content/export";
import { galleryPhotos } from "@/content/gallery";
import { getProduct, products, type ProductSummary } from "@/content/products";
import { packOptions } from "@/content/shop";
import { technicalData } from "@/content/technical-data";
import { JOB_IDS, QUESTIONS, questionsFor, recommend, type Answers, type JobId } from "@/features/finder/model";
import { LAYER_OF_CATEGORY } from "@/features/products/catalog-data";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * What the assistant knows: the website's own content, written out as compact
 * text in the page's language. Built from the same sources as the pages, so it
 * changes when they do and never holds anything the site does not say.
 */
export function buildKnowledge(t: Dictionary, locale: Locale): string {
  const href = (path: string) => localizePath(locale, path);
  const lines: string[] = [];
  const section = (title: string) => lines.push("", `## ${title}`);
  const systems = finderSystems(t);

  section("Company");
  lines.push(
    `${company.legalName}. ${t.footer.description}`,
    t.home.manufacturing.text,
    `Plant: ${t.address.street}, ${t.address.city}, ${t.address.country}.`,
    `Quality and certificates: ${t.home.credentials.map((item) => `${item.code} (${item.label})`).join("; ")}.`,
    `Phone: ${company.phones.map((phone) => phone.display).join(", ")}. Email: ${company.email}.`,
    `Pages: ${t.nav.about} ${href(routes.about)}, ${t.nav.contact} ${href(routes.contact)}.`,
  );

  section("Product categories");
  for (const category of productCategories) {
    const copy = t.productCategories[category.key];
    lines.push(`- ${copy.name}: ${copy.description} (${href(category.path)})`);
  }

  section("How a wall is built, layer by layer (homepage)");
  t.home.system.steps.forEach((step, index) => {
    const categories = productCategories
      .filter((category) => LAYER_OF_CATEGORY[category.key] === index)
      .map((category) => t.productCategories[category.key].name);
    lines.push(`${index + 1}. ${step.title}: ${step.text} (${categories.join(", ")})`);
  });
  lines.push(`${t.home.system.finished.title}: ${t.home.system.finished.text}`);

  section("Products");
  lines.push(
    "Prices are not published: every product is 'price on request'. Only the data below is published; anything missing is 'not published yet'.",
  );
  for (const product of products) lines.push(productFacts(product, t, locale, systems));

  section("Quantities");
  lines.push(
    "Estimate = area (m²) × the product's kg per m², given as a range; packs = kg ÷ pack size, rounded up. Say it is an estimate from the average coverage and link the calculator " +
      `${href(routes.calculator)}. Products without a published coverage have no estimate: say so.`,
  );

  section("Product finder: which products for which job");
  lines.push(`Page: ${t.nav.finder} ${href(routes.finder)}. Recommended systems, in order of use:`);
  for (const system of systems) lines.push(`- ${system.label} → ${system.steps.join(" → ")}`);
  lines.push("These follow each product's published purpose; for a specific project, customers should ask Dekorfix.");

  section("Shop and ordering");
  lines.push(
    `Products are added to the cart (${t.shop.cart.title} ${href(routes.cart)}) and sent as an order at checkout (${t.pages.checkout.title} ${href(routes.checkout)}).`,
    "An order is a request: Dekorfix then contacts the customer to confirm prices, availability, delivery and payment. Nothing is paid online.",
    `Delivery to the customer's address or site (cost and date confirmed by Dekorfix), or pick-up from the factory: ${t.address.street}, ${t.address.city}.`,
    `Catalogue with search and filters: ${t.nav.products} ${href(routes.products)}.`,
  );

  section("Where Dekorfix products go (export)");
  lines.push(
    `Page with maps: ${t.nav.export} ${href(routes.export)}.`,
    `In Kosovo, Dekorfix products go to these ${exportCities.length} cities: ${exportCities
      .map((city) => `${city.name} (${Math.round(distanceKm(factory, city))} km from the factory)`)
      .join(", ")}.`,
    "Dekorfix does not publish store names, addresses, phone numbers or opening hours in these cities: never guess them. To get products, the customer can order online on this site or call Dekorfix.",
    `Outside Kosovo, Dekorfix exports to ${exportCountries.length} countries: ${exportCountries
      .map((country) => country.name[locale])
      .join(", ")}. Distributor names and prices abroad are not published; for export orders or distribution, point to the contact page ${href(routes.contact)}.`,
  );

  section("Gallery");
  lines.push(
    `${t.galleryPage.title} ${t.galleryPage.intro} ${href(routes.projects)}. Photos: ${galleryPhotos.map((photo) => photo.alt[locale]).join("; ")}.`,
  );

  section("Tools and other pages");
  lines.push(
    `- ${t.pages.projectStudio.title} (${href(routes.projectStudio)}): ${t.pages.projectStudio.description}`,
    `- ${t.calculatorPage.eyebrow} (${href(routes.calculator)}): ${t.calculatorPage.description}`,
    `- ${t.pages.search.title} (${href(routes.search)})`,
    `- Privacy (${href(routes.privacy)}), terms (${href(routes.terms)}), cookies (${href(routes.cookies)}). The site sets no cookies.`,
  );

  return lines.join("\n").trim();
}

/**
 * The page the visitor has open, so "this product" or "this page" can be
 * answered. Only known site paths reach here (checked by the route).
 */
export function describePage(path: string, t: Dictionary): string {
  const [pathname = "", query = ""] = path.split("?");
  const rest = pathname.replace(/^\/(sq|en)/, "") || "/";
  const product = /^\/products\/([a-z0-9-]+)$/.exec(rest);
  if (product) {
    const found = getProduct(product[1] ?? "");
    if (found) return `The visitor is on the product page of ${found.name} (${t.productCategories[found.category].name}). "This product" means ${found.name}.`;
  }
  const category = new URLSearchParams(query).get("category");
  if (rest === "/products" && category && category in t.productCategories) {
    return `The visitor is browsing the ${t.productCategories[category as keyof Dictionary["productCategories"]].name} category of the catalogue.`;
  }
  const titles: Record<string, string> = {
    "/": t.nav.home,
    "/products": t.nav.products,
    "/product-finder": t.nav.finder,
    "/projects": t.nav.projects,
    "/project-studio": t.nav.projectStudio,
    "/calculator": t.calculatorPage.eyebrow,
    "/export": t.nav.export,
    "/about": t.nav.about,
    "/contact": t.nav.contact,
    "/cart": t.shop.cart.title,
    "/checkout": t.pages.checkout.title,
  };
  const title = titles[rest];
  return title ? `The visitor is on the "${title}" page.` : "";
}

type System = { label: string; steps: string[]; slugs: Array<{ slug: string; step: string }> };

/** Every product-finder system, with the products of each step. */
function finderSystems(t: Dictionary): System[] {
  return JOB_IDS.flatMap((job) =>
    answerCombinations(job).map((answers) => {
      const label = [
        t.finder.jobs[job].title,
        ...questionsFor(job, answers).map((id) => {
          const options = t.finder.questions[id].options as Record<string, { label: string } | undefined>;
          return options[answers[id] ?? ""]?.label;
        }),
      ]
        .filter(Boolean)
        .join(" / ");
      const steps = recommend(job, answers);
      return {
        label,
        steps: steps.map(
          (step) => `${t.finder.roles[step.role].title}: ${step.products.map(nameOf).join(step.pick === "one" ? " or " : " + ")}`,
        ),
        slugs: steps.flatMap((step) => step.products.map((slug) => ({ slug, step: t.finder.roles[step.role].title }))),
      };
    }),
  );
}

/** One product's published facts, with worked quantities and where it is used. */
function productFacts(product: ProductSummary, t: Dictionary, locale: Locale, systems: System[]): string {
  const number = new Intl.NumberFormat(locale === "sq" ? "sq-AL" : "en-GB", { maximumFractionDigits: 2 });
  const coverage = technicalData[product.slug]?.coverage;
  const packs = packOptions(product.slug).filter((kg): kg is number => kg !== null);
  const layer = t.home.system.steps[LAYER_OF_CATEGORY[product.category]];
  const facts = [
    `category ${t.productCategories[product.category].name}`,
    product.category === "mesh"
      ? "sold by the roll; roll size not published yet"
      : packs.length
        ? `packs ${packs.map((kg) => `${number.format(kg)} kg`).join(", ")}`
        : "pack size not published yet",
  ];
  if (coverage) {
    const low = 1 / coverage.maxM2PerKg;
    const high = 1 / coverage.minM2PerKg;
    const biggest = Math.max(...packs, 0);
    const example = biggest
      ? ` ≈ ${Math.ceil(100 * low / biggest)}–${Math.ceil(100 * high / biggest)} packs of ${biggest} kg`
      : "";
    facts.push(
      `average coverage ${number.format(coverage.minM2PerKg)}–${number.format(coverage.maxM2PerKg)} m²/kg, i.e. ${number.format(low)}–${number.format(high)} kg per m²; for 100 m²: ${Math.round(100 * low)}–${Math.round(100 * high)} kg${example}`,
    );
  } else {
    facts.push("coverage not published yet");
  }
  if (layer) facts.push(`layer in the wall: ${layer.title}`);
  const uses = [...new Set(systems.filter((system) => system.slugs.some((entry) => entry.slug === product.slug)).map((system) => system.label))];
  if (uses.length) facts.push(`recommended for: ${uses.join("; ")}`);
  return `- ${product.name}: ${product.summary[locale]}. ${facts.join("; ")}. Page: ${localizePath(locale, routes.product(product.slug))}`;
}

const nameOf = (slug: string) => products.find((product) => product.slug === slug)?.name ?? slug;

/** Every complete set of answers a job can have (a few per job). */
function answerCombinations(job: JobId): Answers[] {
  const results: Answers[] = [];
  const walk = (answers: Answers) => {
    const next = questionsFor(job, answers).find((id) => !answers[id]);
    if (!next) return void results.push(answers);
    for (const value of QUESTIONS[next]) walk({ ...answers, [next]: value });
  };
  walk({});
  return results;
}

/**
 * A worked estimate when the visitor gives an area ("40 m²") for a product,
 * named in the message or earlier in the chat, or the product page they are
 * on. Computed here because a small model is unreliable at arithmetic.
 */
export function quantityNote(texts: string[], page: string | null, locale: Locale): string {
  const latest = texts.at(-1) ?? "";
  const area = /(\d+(?:[.,]\d+)?)\s*(?:m2|m²|m\^2|sqm|metra? katror|metër katror|square met)/i.exec(latest);
  if (!area?.[1]) return "";
  const m2 = Number(area[1].replace(",", "."));
  if (!(m2 > 0 && m2 < 100000)) return "";

  const mentioned = (text: string) =>
    products.filter((product) => text.toLowerCase().includes(product.name.toLowerCase().split(" ")[0] ?? product.slug));
  let found: ProductSummary[] = [];
  for (const text of [...texts].reverse()) {
    found = mentioned(text);
    if (found.length) break;
  }
  if (!found.length && page) {
    const onPage = getProduct(/\/products\/([a-z0-9-]+)$/.exec(page.split("?")[0] ?? "")?.[1] ?? "");
    if (onPage) found = [onPage];
  }

  const number = new Intl.NumberFormat(locale === "sq" ? "sq-AL" : "en-GB", { maximumFractionDigits: 1 });
  const notes = found.slice(0, 3).map((product) => {
    const coverage = technicalData[product.slug]?.coverage;
    if (!coverage) return `${product.name}: no published coverage, so no estimate.`;
    const low = m2 / coverage.maxM2PerKg;
    const high = m2 / coverage.minM2PerKg;
    const packs = packOptions(product.slug)
      .filter((kg): kg is number => kg !== null)
      .map((kg) => {
        const from = Math.ceil(low / kg);
        const to = Math.ceil(high / kg);
        return `${from === to ? from : `${from}–${to}`} × ${kg} kg`;
      });
    return `${product.name} for ${number.format(m2)} m²: ${number.format(low)}–${number.format(high)} kg${packs.length ? ` (${packs.join(" or ")})` : ""}.`;
  });
  return notes.length ? `Computed estimate (use these exact figures): ${notes.join(" ")}` : "";
}
