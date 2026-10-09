"use client";

import { ArrowLeft, ArrowRight, Calculator, Check, MessageSquare, RotateCcw, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import { packOptions } from "@/content/shop";
import { useCart } from "@/features/shop/cart-context";
import type { ShopProduct } from "@/features/shop/shop-products";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

import {
  chosenProducts,
  JOB_IDS,
  nextQuestion,
  QUESTIONS,
  questionsFor,
  recommend,
  type Answers,
  type JobId,
  type QuestionId,
} from "./model";
import "./finder.css";

type Copy = Dictionary["finder"];

export interface FinderLinks {
  calculator: string;
  studio: string;
  contact: string;
}

const isJob = (value: string | null): value is JobId => JOB_IDS.includes(value as JobId);

/** A question's answer options, looked up by the stored answer. */
const optionsOf = (copy: Copy, id: QuestionId) =>
  copy.questions[id].options as Record<string, { label: string; text: string } | undefined>;

/** The finder opened on the job in the address (`?job=facade`), e.g. from the menu. */
export function ProductFinderFromUrl(props: { copy: Copy; links: FinderLinks }) {
  const job = useSearchParams().get("job");
  return <ProductFinder {...props} initialJob={isJob(job) ? job : null} />;
}

/**
 * A few questions, one at a time, then the Dekorfix system for the job: each
 * step in order with its product (or a choice of products), and one button to
 * add the lot to the cart.
 */
export function ProductFinder({ copy, links, initialJob = null }: { copy: Copy; links: FinderLinks; initialJob?: JobId | null }) {
  const [job, setJob] = useState<JobId | null>(initialJob);
  const [answers, setAnswers] = useState<Answers>({});
  const [choices, setChoices] = useState<Partial<Record<number, string>>>({});
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // A menu link to another job while the finder is open starts over on that job.
  const [seenJob, setSeenJob] = useState(initialJob);
  if (initialJob !== seenJob) {
    setSeenJob(initialJob);
    setJob(initialJob);
    setAnswers({});
    setChoices({});
  }

  const question = job ? nextQuestion(job, answers) : null;
  const asked = job ? questionsFor(job, answers) : [];
  const stage = !job ? "job" : (question ?? "result");
  // Progress: the job, each question, then the result.
  const segments = job ? asked.length + 2 : 3;
  const position = !job ? 0 : question ? asked.indexOf(question) + 1 : segments - 1;

  const go = (change: () => void, towards: "forward" | "back") => {
    setDirection(towards);
    change();
    requestAnimationFrame(() => document.getElementById("finder")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const chooseJob = (next: JobId) =>
    go(() => {
      setJob(next);
      setAnswers({});
      setChoices({});
    }, "forward");
  const answer = (id: QuestionId, value: string) => go(() => setAnswers((current) => ({ ...current, [id]: value })), "forward");
  /** Back to a question: forget its answer and every later one. */
  const reopen = (id: QuestionId) =>
    go(() => {
      if (!job) return;
      const order = questionsFor(job, answers);
      setAnswers(Object.fromEntries(order.slice(0, order.indexOf(id)).map((key) => [key, answers[key]])));
      setChoices({});
    }, "back");
  const back = () => {
    const last = [...asked].reverse().find((key) => answers[key]);
    if (last) reopen(last);
    else go(() => setJob(null), "back");
  };
  const restart = () => go(() => setJob(null), "back");

  return (
    <div id="finder" className="pf scroll-mt-24">
      <Progress segments={segments} position={position} />

      {job && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-small text-text-tertiary">{copy.answers}:</span>
          <button type="button" onClick={restart} className="pf-chip">
            {copy.jobs[job].title}
          </button>
          {asked
            .filter((key) => answers[key])
            .map((key) => (
              <button key={key} type="button" onClick={() => reopen(key)} className="pf-chip">
                {optionsOf(copy, key)[answers[key] ?? ""]?.label}
              </button>
            ))}
        </div>
      )}

      <div key={stage + (job ?? "")} data-direction={direction} className="pf-stage mt-10 md:mt-14">
        {stage === "job" && <JobStage copy={copy} onChoose={chooseJob} />}
        {question && (
          <QuestionStage
            id={question}
            copy={copy}
            step={asked.indexOf(question) + 1}
            total={asked.length}
            onAnswer={(value) => answer(question, value)}
            onBack={back}
          />
        )}
        {stage === "result" && job && (
          <Result
            job={job}
            answers={answers}
            choices={choices}
            onChoose={(index, slug) => setChoices((current) => ({ ...current, [index]: slug }))}
            copy={copy}
            links={links}
            onBack={back}
            onRestart={restart}
            onJob={chooseJob}
          />
        )}
      </div>
    </div>
  );
}

function Progress({ segments, position }: { segments: number; position: number }) {
  return (
    <div aria-hidden className="flex gap-1.5">
      {Array.from({ length: segments }, (_, index) => (
        <span key={index} className="pf-seg" data-state={index < position ? "done" : index === position ? "current" : undefined} />
      ))}
    </div>
  );
}

/** Number keys pick an option: 1 for the first, 2 for the second… */
function useNumberKeys(count: number, onPick: (index: number) => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < count) onPick(index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, onPick]);
}

function StageHeader({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="mb-8 max-w-2xl md:mb-10">
      {eyebrow && <p className="mb-3 text-small tabular-nums text-text-tertiary">{eyebrow}</p>}
      <h2 className="text-h2 text-text">{title}</h2>
      {text && <p className="mt-3 text-lead text-text-secondary">{text}</p>}
    </div>
  );
}

function JobStage({ copy, onChoose }: { copy: Copy; onChoose: (job: JobId) => void }) {
  const { products } = useCart();
  useNumberKeys(JOB_IDS.length, (index) => {
    const job = JOB_IDS[index];
    if (job) onChoose(job);
  });
  return (
    <>
      <StageHeader title={copy.start} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
        {JOB_IDS.map((job, index) => {
          const image = products.find((product) => product.slug === copy.jobs[job].image)?.image;
          return (
            <li key={job} className="pf-rise" style={{ "--i": index } as CSSProperties}>
              <button type="button" onClick={() => onChoose(job)} className="pf-job group/job">
                <span className="pf-job-key tabular-nums">{index + 1}</span>
                <span className="pf-job-shot">
                  {image && (
                    <Image src={image} alt="" fill sizes="(min-width: 1024px) 18vw, (min-width: 640px) 45vw, 40vw" className="pf-job-pack object-contain" />
                  )}
                </span>
                <span className="pf-job-copy">
                  <span className="block text-h4 text-text">{copy.jobs[job].title}</span>
                  <span className="mt-1.5 block text-small text-text-secondary">{copy.jobs[job].text}</span>
                </span>
                <ArrowRight aria-hidden className="pf-job-arrow size-4" strokeWidth={1.75} />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function QuestionStage({
  id,
  copy,
  step,
  total,
  onAnswer,
  onBack,
}: {
  id: QuestionId;
  copy: Copy;
  step: number;
  total: number;
  onAnswer: (value: string) => void;
  onBack: () => void;
}) {
  const question = copy.questions[id];
  const options = QUESTIONS[id];
  const [picked, setPicked] = useState<string | null>(null);
  // A short beat on the chosen card before moving on, so the choice registers.
  const pick = (value: string) => {
    if (picked) return;
    setPicked(value);
    setTimeout(() => onAnswer(value), 220);
  };
  useNumberKeys(options.length, (index) => {
    const value = options[index];
    if (value) pick(value);
  });

  return (
    <>
      <StageHeader
        eyebrow={copy.stepOf.replace("{n}", String(step)).replace("{total}", String(total))}
        title={question.title}
        text={question.text}
      />
      <ul className={cn("grid gap-3 lg:gap-4", options.length === 3 ? "md:grid-cols-3" : "sm:grid-cols-2")}>
        {options.map((value, index) => {
          const option = optionsOf(copy, id)[value];
          if (!option) return null;
          return (
            <li key={value} className="pf-rise" style={{ "--i": index } as CSSProperties}>
              <button
                type="button"
                onClick={() => pick(value)}
                aria-pressed={picked === value}
                className="pf-option group/option"
              >
                <span className="pf-option-key tabular-nums">{String.fromCharCode(65 + index)}</span>
                <span className="block text-h4 text-text">{option.label}</span>
                <span className="mt-2 block text-small text-text-secondary">{option.text}</span>
                <span aria-hidden className="pf-option-check">
                  <Check className="size-4" strokeWidth={2} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={onBack} className="pf-back mt-8">
        <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
        {copy.back}
      </button>
    </>
  );
}

function Result({
  job,
  answers,
  choices,
  onChoose,
  copy,
  links,
  onBack,
  onRestart,
  onJob,
}: {
  job: JobId;
  answers: Answers;
  choices: Partial<Record<number, string>>;
  onChoose: (index: number, slug: string) => void;
  copy: Copy;
  links: FinderLinks;
  onBack: () => void;
  onRestart: () => void;
  onJob: (job: JobId) => void;
}) {
  const { products, addMany } = useCart();
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const steps = recommend(job, answers);
  const chosen = chosenProducts(steps, choices)
    .map((slug) => bySlug.get(slug))
    .filter((product): product is ShopProduct => Boolean(product));
  const result = copy.result;

  return (
    <>
      <StageHeader eyebrow={result.eyebrow} title={result.title.replace("{job}", copy.jobs[job].title)} />
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <ol className="lg:col-span-8">
          {steps.map((step, index) => (
            <li key={`${step.role}-${index}`} className="pf-step" style={{ "--i": index } as CSSProperties}>
              <span aria-hidden className="pf-node tabular-nums">
                {index + 1}
              </span>
              <div className="min-w-0 pb-10">
                <p className="text-label uppercase text-brand-text">
                  {result.step.replace("{n}", String(index + 1))} · {copy.roles[step.role].title}
                </p>
                <p className="mt-2 text-small text-text-secondary">{copy.roles[step.role].text}</p>
                {step.pick === "one" && <p className="mt-4 text-small font-medium text-text">{result.chooseOne}</p>}
                <div className={cn("mt-4 grid gap-3", step.products.length > 1 && "sm:grid-cols-2")}>
                  {step.products.map((slug) => {
                    const product = bySlug.get(slug);
                    if (!product) return null;
                    if (step.pick === "all") return <ProductRow key={slug} product={product} viewLabel={result.view} />;
                    const selected = (choices[index] ?? step.products[0]) === slug;
                    return (
                      <ProductRow key={slug} product={product} viewLabel={result.view}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          aria-label={product.name}
                          onClick={() => onChoose(index, slug)}
                          className="pf-pick"
                        >
                          <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
                        </button>
                      </ProductRow>
                    );
                  })}
                </div>
              </div>
            </li>
          ))}
          {job === "blocks" && (
            <li className="pf-step" style={{ "--i": steps.length } as CSSProperties}>
              <span aria-hidden className="pf-node pf-node--next">
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </span>
              <button type="button" onClick={() => onJob("walls")} className="pf-next">
                {result.blocksNext}
                <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
              </button>
            </li>
          )}
        </ol>

        <aside className="lg:col-span-4">
          <div className="pf-summary lg:sticky lg:top-28">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-h4 text-text">{result.list}</h3>
              <span className="text-small tabular-nums text-text-tertiary">
                {result.count.replace("{n}", String(chosen.length))}
              </span>
            </div>
            <ul className="mt-5 space-y-2.5">
              {chosen.map((product, index) => (
                <li key={product.slug} className="flex items-center gap-3">
                  <span className="w-5 text-caption tabular-nums text-text-tertiary">{index + 1}</span>
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-xs border border-border bg-background">
                    <Image src={product.image} alt="" fill sizes="40px" className="object-contain p-0.5" />
                  </span>
                  <span className="min-w-0 truncate text-small font-medium text-text">{product.name}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => addMany(chosen.map((product) => ({ slug: product.slug, packKg: packOptions(product.slug)[0] ?? null, quantity: 1 })))}
              className="pf-add mt-6"
            >
              <ShoppingBag aria-hidden className="size-[1.125rem]" strokeWidth={1.75} />
              {result.addAll}
            </button>
            <Link href={job === "facade" ? links.studio : links.calculator} className="pf-secondary mt-2.5">
              <Calculator aria-hidden className="size-4" strokeWidth={1.75} />
              {result.quantities}
            </Link>
            <p className="mt-5 text-caption leading-relaxed text-text-tertiary">
              {result.note}{" "}
              <Link href={links.contact} className="inline-flex items-center gap-1 font-medium text-text underline underline-offset-4">
                <MessageSquare aria-hidden className="size-3" strokeWidth={2} />
                {result.ask}
              </Link>
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            <button type="button" onClick={onBack} className="pf-back">
              <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
              {copy.back}
            </button>
            <button type="button" onClick={onRestart} className="pf-back">
              <RotateCcw aria-hidden className="size-4" strokeWidth={1.75} />
              {copy.restart}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

/** A product in a step: packshot, category, name and summary; `children` is a selector for choices. */
function ProductRow({ product, viewLabel, children }: { product: ShopProduct; viewLabel: string; children?: ReactNode }) {
  return (
    <div className={cn("pf-product", Boolean(children) && "pf-product--choice")}>
      <span className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-surface-muted sm:size-24">
        <Image src={product.image} alt="" fill sizes="96px" className="object-contain p-2" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-caption uppercase tracking-[0.06em] text-brand-text">{product.categoryLabel}</span>
        <span className="mt-1 block text-h4 text-text">{product.name}</span>
        <span className="mt-1 block text-small text-text-secondary">{product.summary}</span>
        <Link href={product.href} className="mt-2 inline-flex items-center gap-1.5 text-small font-medium text-text hover:underline">
          {viewLabel}
          <ArrowRight aria-hidden className="size-3.5" strokeWidth={1.75} />
        </Link>
      </span>
      {children}
    </div>
  );
}
