import { productCategories } from "@/config/navigation";
import { routes } from "@/config/routes";
import { company } from "@/config/site";
import { products } from "@/content/products";
import { packOptions } from "@/content/shop";
import { distanceKm, factory, stores } from "@/content/stores";
import { technicalData } from "@/content/technical-data";
import { JOB_IDS, QUESTIONS, questionsFor, recommend, type Answers, type JobId } from "@/features/finder/model";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * What the assistant knows: the website's own content, written out as compact
 * text in the page's language. Built from the same sources as the pages, so it
 * changes when they do and never holds anything the site does not say.
 */
export function buildKnowledge(t: Dictionary, locale: Locale): string {
  const href = (path: string) => localizePath(locale, path);
  const number = new Intl.NumberFormat(locale === "sq" ? "sq-AL" : "en-GB", { maximumFractionDigits: 2 });
  const lines: string[] = [];
  const section = (title: string) => lines.push("", `## ${title}`);

  section("Company");
  lines.push(
    `${company.legalName}. ${t.footer.description}`,
    `${t.home.manufacturing.text}`,
    `Address: ${t.address.street}, ${t.address.city}, ${t.address.country}.`,
    `Phone: ${company.phones.map((phone) => phone.display).join(", ")}. Email: ${company.email}.`,
    `Pages: ${t.nav.contact} ${href(routes.contact)}, ${t.nav.about} ${href(routes.about)}.`,
  );

  section("Product categories");
  for (const category of productCategories) {
    const copy = t.productCategories[category.key];
    lines.push(`- ${copy.name}: ${copy.description} (${href(category.path)})`);
  }

  section("Products");
  lines.push("Prices are not published: every product is 'price on request'. Only the data below is published.");
  for (const product of products) {
    const data = technicalData[product.slug];
    const packs = packOptions(product.slug).filter((kg): kg is number => kg !== null);
    const facts = [
      t.productCategories[product.category].name,
      packs.length ? `packs ${packs.map((kg) => `${number.format(kg)} kg`).join(", ")}` : "pack size not published",
      data?.coverage
        ? `average coverage ${number.format(data.coverage.minM2PerKg)}–${number.format(data.coverage.maxM2PerKg)} m²/kg`
        : "coverage not published",
      product.category === "mesh" ? "sold by the roll" : null,
    ].filter(Boolean);
    lines.push(`- ${product.name}: ${product.summary[locale]}. ${facts.join("; ")}. ${href(routes.product(product.slug))}`);
  }

  section("Product finder: which products for which job");
  lines.push(`Page: ${t.nav.finder} ${href(routes.finder)}. Recommended systems, in order of use:`);
  for (const job of JOB_IDS) {
    for (const answers of answerCombinations(job)) {
      const label = [
        t.finder.jobs[job].title,
        ...questionsFor(job, answers).map((id) => {
          const options = t.finder.questions[id].options as Record<string, { label: string } | undefined>;
          return options[answers[id] ?? ""]?.label;
        }),
      ]
        .filter(Boolean)
        .join(" / ");
      const steps = recommend(job, answers).map(
        (step) => `${t.finder.roles[step.role].title}: ${step.products.map(nameOf).join(step.pick === "one" ? " or " : " + ")}`,
      );
      lines.push(`- ${label} → ${steps.join(" → ")}`);
    }
  }
  lines.push("These follow each product's published purpose; for a specific project, customers should ask Dekorfix.");

  section("Shop and ordering");
  lines.push(
    `Products are added to the cart (${t.shop.cart.title} ${href(routes.cart)}) and sent as an order at checkout (${t.pages.checkout.title} ${href(routes.checkout)}).`,
    "An order is a request: Dekorfix then contacts the customer to confirm prices, availability, delivery and payment. Nothing is paid online.",
    `Delivery to the customer's address or site (cost and date confirmed by Dekorfix), or pick-up from the factory: ${t.address.street}, ${t.address.city}.`,
    `Catalogue with search and filters: ${t.nav.products} ${href(routes.products)}.`,
  );

  section("Points of sale");
  lines.push(
    `Page with a map: ${t.nav.whereToBuy} ${href(routes.whereToBuy)}.`,
    `Dekorfix has one point of sale in each of these ${stores.length} cities: ${stores
      .map((store) => `${store.city} (${Math.round(distanceKm(factory, store))} km from the factory)`)
      .join(", ")}.`,
    stores.some((store) => !store.confirmed)
      ? "So for any of these cities the answer is yes, there is a point of sale there. Its name, address, phone and opening hours are not published yet: never guess them; point to the page and to Dekorfix's phone."
      : "",
  );

  section("Tools and other pages");
  lines.push(
    `- ${t.pages.projectStudio.title} (${href(routes.projectStudio)}): ${t.pages.projectStudio.description}`,
    `- ${t.calculatorPage.eyebrow} (${href(routes.calculator)}): ${t.calculatorPage.description}`,
    `- ${t.pages.projects.title} (${href(routes.projects)}): ${t.pages.projects.description}`,
    `- ${t.pages.search.title} (${href(routes.search)})`,
    `- Privacy (${href(routes.privacy)}), terms (${href(routes.terms)}), cookies (${href(routes.cookies)}). The site sets no cookies.`,
  );

  return lines.join("\n").trim();
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
