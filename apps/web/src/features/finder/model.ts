/*
 * Product finder: a job and a few answers give an ordered system of Dekorfix
 * products. Pure (no imports), so it runs under `node --test`.
 *
 * The rules only use what is already agreed: the task groupings in
 * content/solutions.ts, the facade build-ups in Project Studio
 * (project-studio/model/systems.ts) and each product's own descriptor.
 * Like those, they are to be confirmed by Dekorfix.
 */

export type JobId = "facade" | "tiles" | "walls" | "painting" | "blocks";
export const JOB_IDS: JobId[] = ["facade", "tiles", "walls", "painting", "blocks"];

export type QuestionId = "insulation" | "mesh" | "tileType" | "tileBase" | "wallStart" | "paintBase";

/** Each question and its answers, in the order they are asked. */
export const QUESTIONS: Record<QuestionId, string[]> = {
  insulation: ["yes", "no"],
  mesh: ["yes", "no"],
  tileType: ["ceramic", "heat", "special"],
  tileBase: ["concrete", "other"],
  wallStart: ["concrete", "blocks", "plastered"],
  paintBase: ["concrete", "finished"],
};

export type Answers = Partial<Record<QuestionId, string>>;

/** The questions a job asks, given the answers so far (a later question may depend on an earlier one). */
export function questionsFor(job: JobId, answers: Answers): QuestionId[] {
  switch (job) {
    case "facade":
      return answers.insulation === "no" ? ["insulation", "mesh"] : ["insulation"];
    case "tiles":
      return ["tileType", "tileBase"];
    case "walls":
      return ["wallStart"];
    case "painting":
      return ["paintBase"];
    case "blocks":
      return [];
  }
}

/** The first question still unanswered, or null when the system can be shown. */
export function nextQuestion(job: JobId, answers: Answers): QuestionId | null {
  return questionsFor(job, answers).find((question) => !answers[question]) ?? null;
}

export type StepRole = "prepare" | "bond" | "reinforce" | "mesh" | "plaster" | "level" | "prime" | "finish";

export interface SystemStep {
  role: StepRole;
  /** Product slugs. */
  products: string[];
  /** "all": use every product listed; "one": the customer picks one of them. */
  pick: "all" | "one";
}

const all = (role: StepRole, ...products: string[]): SystemStep => ({ role, products, pick: "all" });
const one = (role: StepRole, ...products: string[]): SystemStep => ({ role, products, pick: "one" });

const PAINTS = one("finish", "fasadex", "premium");
const MESH = one("mesh", "fiberglass-mesh-red", "fiberglass-mesh-white");

/** The products for a job, in the order they are applied. */
export function recommend(job: JobId, answers: Answers): SystemStep[] {
  switch (job) {
    case "facade":
      // Project Studio's two facade systems: thermal (EPS) and decorative render.
      if (answers.insulation === "yes") {
        return [all("bond", "styrofix"), all("reinforce", "styrofiber"), MESH, all("prime", "baza"), all("finish", "fasader")];
      }
      return [
        ...(answers.mesh === "yes" ? [all("reinforce", "styrofiber"), MESH] : []),
        all("prime", "baza"),
        all("finish", "fasader"),
      ];
    case "tiles": {
      const adhesive = { ceramic: "cerafix", heat: "thermofix", special: "megafix" }[answers.tileType ?? "ceramic"] ?? "cerafix";
      return [...(answers.tileBase === "concrete" ? [all("prepare", "beton-kontakt")] : []), all("bond", adhesive)];
    }
    case "walls":
      if (answers.wallStart === "plastered") return [one("level", "gletex", "niveler"), PAINTS];
      return [
        ...(answers.wallStart === "concrete" ? [all("prepare", "beton-kontakt")] : []),
        all("plaster", "confix"),
        one("level", "gletex", "niveler"),
        PAINTS,
      ];
    case "painting":
      return [...(answers.paintBase === "concrete" ? [all("prime", "baza")] : []), PAINTS];
    case "blocks":
      return [all("bond", "sipofix")];
  }
}

/** The products to add to the cart: every "all" product, and the chosen (or first) one of each "one" step. */
export function chosenProducts(steps: SystemStep[], choices: Partial<Record<number, string>>): string[] {
  return steps.flatMap((step, index) => {
    if (step.pick === "all") return step.products;
    const choice = choices[index];
    return [choice && step.products.includes(choice) ? choice : (step.products[0] ?? "")].filter(Boolean);
  });
}
