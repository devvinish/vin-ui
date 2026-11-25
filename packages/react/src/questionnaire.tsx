"use client";

import * as React from "react";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Questionnaire (React). API: spec/questionnaire.json.
 * Multiple-choice questions inside a chat, built from real radios and checkboxes,
 * with an optional "Other" text box, Submit and Skip, and a read-only state once answered.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type QuestionOption = string | { value: string; label: React.ReactNode };
export type Question = {
  id: string;
  prompt: React.ReactNode;
  /** Small text under the prompt, e.g. "Choose any." */
  hint?: React.ReactNode;
  /** Checkboxes instead of radios. */
  multiple?: boolean;
  options: QuestionOption[];
  /** Add an "Other" option with a text box. A string sets its label. */
  other?: boolean | string;
};
/** Answers by question id: a string for single choice, a list for multiple. "Other" gives the typed text. */
export type QuestionnaireAnswers = Record<string, string | string[]>;
export type QuestionnaireState = "open" | "submitted" | "skipped";

const OTHER = "other";
const norm = (o: QuestionOption) => (typeof o === "string" ? { value: o, label: o as React.ReactNode } : o);

export type QuestionnaireProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "title"> & {
  questions: Question[];
  /** A heading above the questions. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Name for the form when there's no title. */
  label?: string;
  /** Chosen values by question id (use "other" for the Other option). */
  defaultValues?: Record<string, string[]>;
  /** Typed "Other" text by question id. */
  defaultOther?: Record<string, string>;
  state?: QuestionnaireState;
  defaultState?: QuestionnaireState;
  onSubmit?: (answers: QuestionnaireAnswers) => void;
  onSkip?: () => void;
  submitLabel?: string;
  /** Pass null to hide the Skip button. */
  skipLabel?: string | null;
  /** Shown after Submit. Default: "Answer sent" or "Answers sent". */
  submittedText?: React.ReactNode;
  /** Shown after Skip. Default: "Skipped". */
  skippedText?: React.ReactNode;
};

export function Questionnaire({
  questions, title, description, label, defaultValues = {}, defaultOther = {}, state, defaultState = "open", onSubmit, onSkip,
  submitLabel = "Submit", skipLabel = "Skip", submittedText, skippedText = "Skipped", className, ...rest
}: QuestionnaireProps) {
  const auto = React.useId();
  const base = `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [values, setValues] = React.useState<Record<string, string[]>>(defaultValues);
  const [other, setOther] = React.useState<Record<string, string>>(defaultOther);
  const [innerState, setInnerState] = React.useState<QuestionnaireState>(defaultState);
  const current = state ?? innerState;
  const done = current !== "open";
  const statusRef = React.useRef<HTMLParagraphElement>(null);
  const finishedHere = React.useRef(false);

  if (isDev() && !title && !label && !rest["aria-label"] && !rest["aria-labelledby"]) {
    console.warn("VinUI Questionnaire: pass a title or a label so the form has a name.");
  }

  // After Submit or Skip the buttons go away: move focus to the status line so keyboard users stay in place.
  React.useEffect(() => {
    if (done && finishedHere.current) { statusRef.current?.focus(); finishedHere.current = false; }
  }, [done]);

  const finish = (next: QuestionnaireState) => {
    finishedHere.current = true;
    if (state === undefined) setInnerState(next);
  };

  const toggle = (q: Question, value: string, on: boolean) =>
    setValues((all) => {
      const prev = all[q.id] ?? [];
      const next = q.multiple ? (on ? [...prev.filter((v) => v !== value), value] : prev.filter((v) => v !== value)) : [value];
      return { ...all, [q.id]: next };
    });

  const answers = (): QuestionnaireAnswers =>
    Object.fromEntries(questions.map((q) => {
      // In the order the options are listed, like the form itself.
      const order = [...q.options.map((o) => norm(o).value), OTHER];
      const chosen = order.filter((v) => (values[q.id] ?? []).includes(v)).map((v) => (v === OTHER ? other[q.id]?.trim() || OTHER : v));
      return [q.id, q.multiple ? chosen : chosen[0] ?? ""];
    }));

  const titleId = title ? `${base}-title` : undefined;
  const statusText = current === "skipped" ? skippedText : submittedText ?? (questions.length > 1 ? "Answers sent" : "Answer sent");

  return (
    <form
      aria-labelledby={titleId}
      aria-label={titleId ? undefined : label}
      {...rest}
      className={cx("vin-questionnaire", className)}
      data-state={done ? current : undefined}
      onSubmit={(e) => {
        e.preventDefault();
        if (done) return;
        onSubmit?.(answers());
        finish("submitted");
      }}
    >
      {title != null && (
        <div className="vin-questionnaire__header">
          <p className="vin-questionnaire__title" id={titleId}>{title}</p>
          {description != null && <p className="vin-questionnaire__description">{description}</p>}
        </div>
      )}
      {questions.map((q) => {
        const name = `${base}-${q.id}`;
        const chosen = values[q.id] ?? [];
        const opts = q.other ? [...q.options.map(norm), { value: OTHER, label: typeof q.other === "string" ? q.other : "Other" }] : q.options.map(norm);
        return (
          <fieldset className="vin-questionnaire__question" key={q.id} disabled={done}>
            <legend className="vin-questionnaire__prompt">{q.prompt}</legend>
            {q.hint != null && <p className="vin-questionnaire__hint">{q.hint}</p>}
            {opts.map((o, i) => {
              const id = `${name}-${o.value === OTHER ? "other" : i}`;
              return (
                <div className="vin-choice" key={o.value}>
                  <input
                    type={q.multiple ? "checkbox" : "radio"}
                    className={q.multiple ? "vin-checkbox" : "vin-radio"}
                    id={id}
                    name={name}
                    value={o.value}
                    checked={chosen.includes(o.value)}
                    onChange={(e) => toggle(q, o.value, e.currentTarget.checked)}
                  />
                  <div className="vin-choice__body">
                    <label className="vin-choice__label" htmlFor={id}>{o.label}</label>
                    {o.value === OTHER && (
                      <input
                        type="text"
                        className="vin-input vin-input--sm vin-questionnaire__other"
                        name={`${name}-other`}
                        aria-label="Other answer"
                        value={other[q.id] ?? ""}
                        onChange={(e) => { const v = e.currentTarget.value; setOther((all) => ({ ...all, [q.id]: v })); }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </fieldset>
        );
      })}
      {!done && (
        <div className="vin-questionnaire__actions">
          {skipLabel !== null && (
            <button type="button" className="vin-btn vin-btn--ghost vin-btn--sm" onClick={() => { onSkip?.(); finish("skipped"); }}>{skipLabel}</button>
          )}
          <button type="submit" className="vin-btn vin-btn--sm">{submitLabel}</button>
        </div>
      )}
      {done && (
        <p className="vin-questionnaire__status" role="status" tabIndex={-1} ref={statusRef}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {current === "skipped" ? <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></> : <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>}
          </svg>
          {statusText}
        </p>
      )}
    </form>
  );
}
