<!--
  VinUI · Questionnaire (Svelte). API: spec/questionnaire.json.
  Multiple-choice questions inside a chat, built from real radios and checkboxes,
  with an optional "Other" text box, Submit and Skip, and a read-only state once answered.
  bind:state works.
-->
<script lang="ts" module>
  export type QuestionOption = string | { value: string; label: string };
  export type Question = {
    id: string;
    prompt: string;
    /** Small text under the prompt, e.g. "Choose any." */
    hint?: string;
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
  const norm = (o: QuestionOption) => (typeof o === "string" ? { value: o, label: o } : o);
</script>

<script lang="ts">
  import { tick, type Snippet } from "svelte";
  import type { HTMLFormAttributes } from "svelte/elements";

  type Props = Omit<HTMLFormAttributes, "class" | "title" | "onsubmit"> & {
    questions: Question[];
    /** A heading above the questions. */
    title?: string | Snippet;
    description?: string | Snippet;
    /** Name for the form when there's no title. */
    label?: string;
    /** Chosen values by question id (use "other" for the Other option). */
    values?: Record<string, string[]>;
    /** Typed "Other" text by question id. */
    other?: Record<string, string>;
    state?: QuestionnaireState;
    onSubmit?: (answers: QuestionnaireAnswers) => void;
    onSkip?: () => void;
    submitLabel?: string;
    /** Pass null to hide the Skip button. */
    skipLabel?: string | null;
    /** Shown after Submit. Default: "Answer sent" or "Answers sent". */
    submittedText?: string | Snippet;
    /** Shown after Skip. Default: "Skipped". */
    skippedText?: string | Snippet;
    class?: string;
  };
  let {
    questions,
    title,
    description,
    label,
    values = $bindable({}),
    other = $bindable({}),
    state: phase = $bindable("open"),
    onSubmit,
    onSkip,
    submitLabel = "Submit",
    skipLabel = "Skip",
    submittedText,
    skippedText = "Skipped",
    class: className,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const base = `vin-${uid}`;
  const done = $derived(phase !== "open");
  let statusEl = $state<HTMLParagraphElement>();

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !title && !label && !rest["aria-label"] && !rest["aria-labelledby"]) {
      console.warn("VinUI Questionnaire: pass a title or a label so the form has a name.");
    }
  };
  warnIfUnnamed();

  // After Submit or Skip the buttons go away: move focus to the status line so keyboard users stay in place.
  async function finish(next: QuestionnaireState) {
    phase = next;
    await tick();
    statusEl?.focus();
  }

  function toggle(q: Question, value: string, on: boolean) {
    const prev = values[q.id] ?? [];
    const next = q.multiple ? (on ? [...prev.filter((v) => v !== value), value] : prev.filter((v) => v !== value)) : [value];
    values = { ...values, [q.id]: next };
  }

  const answers = (): QuestionnaireAnswers =>
    Object.fromEntries(
      questions.map((q) => {
        // In the order the options are listed, like the form itself.
        const order = [...q.options.map((o) => norm(o).value), OTHER];
        const chosen = order.filter((v) => (values[q.id] ?? []).includes(v)).map((v) => (v === OTHER ? other[q.id]?.trim() || OTHER : v));
        return [q.id, q.multiple ? chosen : (chosen[0] ?? "")];
      }),
    );

  const titleId = $derived(title ? `${base}-title` : undefined);
  const statusText = $derived(phase === "skipped" ? skippedText : (submittedText ?? (questions.length > 1 ? "Answers sent" : "Answer sent")));
  const optionsOf = (q: Question) =>
    q.other ? [...q.options.map(norm), { value: OTHER, label: typeof q.other === "string" ? q.other : "Other" }] : q.options.map(norm);
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<form
  aria-labelledby={titleId}
  aria-label={titleId ? undefined : label}
  {...rest}
  class={["vin-questionnaire", className].filter(Boolean).join(" ")}
  data-state={done ? phase : undefined}
  onsubmit={(e) => {
    e.preventDefault();
    if (done) return;
    onSubmit?.(answers());
    finish("submitted");
  }}
>
  {#if title != null}
    <div class="vin-questionnaire__header">
      <p class="vin-questionnaire__title" id={titleId}>{@render text(title)}</p>
      {#if description != null}<p class="vin-questionnaire__description">{@render text(description)}</p>{/if}
    </div>
  {/if}
  {#each questions as q (q.id)}
    {@const name = `${base}-${q.id}`}
    {@const chosen = values[q.id] ?? []}
    <fieldset class="vin-questionnaire__question" disabled={done}>
      <legend class="vin-questionnaire__prompt">{q.prompt}</legend>
      {#if q.hint != null}<p class="vin-questionnaire__hint">{q.hint}</p>{/if}
      {#each optionsOf(q) as o, i (o.value)}
        {@const id = `${name}-${o.value === OTHER ? "other" : i}`}
        <div class="vin-choice">
          <input
            type={q.multiple ? "checkbox" : "radio"}
            class={q.multiple ? "vin-checkbox" : "vin-radio"}
            {id}
            {name}
            value={o.value}
            checked={chosen.includes(o.value)}
            onchange={(e) => toggle(q, o.value, e.currentTarget.checked)}
          />
          <div class="vin-choice__body">
            <label class="vin-choice__label" for={id}>{o.label}</label>
            {#if o.value === OTHER}
              <input
                type="text"
                class="vin-input vin-input--sm vin-questionnaire__other"
                name={`${name}-other`}
                aria-label="Other answer"
                value={other[q.id] ?? ""}
                oninput={(e) => (other = { ...other, [q.id]: e.currentTarget.value })}
              />
            {/if}
          </div>
        </div>
      {/each}
    </fieldset>
  {/each}
  {#if !done}
    <div class="vin-questionnaire__actions">
      {#if skipLabel !== null}
        <button
          type="button"
          class="vin-btn vin-btn--ghost vin-btn--sm"
          onclick={() => {
            onSkip?.();
            finish("skipped");
          }}>{skipLabel}</button
        >
      {/if}
      <button type="submit" class="vin-btn vin-btn--sm">{submitLabel}</button>
    </div>
  {:else}
    <p class="vin-questionnaire__status" role="status" tabindex="-1" bind:this={statusEl}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        {#if phase === "skipped"}<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />{:else}<circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" />{/if}
      </svg>
      {@render text(statusText)}
    </p>
  {/if}
</form>
