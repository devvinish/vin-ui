<script lang="ts">
/*
 * VinUI · Questionnaire (Vue). API: spec/questionnaire.json.
 * Multiple-choice questions inside a chat, built from real radios and checkboxes,
 * with an optional "Other" text box, Submit and Skip, and a read-only state once answered.
 *   <Questionnaire label="Trip length" :questions="questions" @submit="send" @skip="skip" />
 */
import { computed, nextTick, ref, useAttrs, useId, watch } from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

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

<script setup lang="ts">
const props = withDefaults(defineProps<{
  questions: Question[];
  /** A heading above the questions. */
  title?: string;
  description?: string;
  /** Name for the form when there's no title. */
  label?: string;
  /** Chosen values by question id (use "other" for the Other option). */
  defaultValues?: Record<string, string[]>;
  /** Typed "Other" text by question id. */
  defaultOther?: Record<string, string>;
  /** "open", "submitted" or "skipped" (v-model:state). */
  state?: QuestionnaireState;
  defaultState?: QuestionnaireState;
  submitLabel?: string;
  /** Pass null to hide the Skip button. */
  skipLabel?: string | null;
  /** Shown after Submit. Default: "Answer sent" or "Answers sent". */
  submittedText?: string;
  /** Shown after Skip. Default: "Skipped". */
  skippedText?: string;
}>(), { defaultState: "open", submitLabel: "Submit", skipLabel: "Skip", skippedText: "Skipped" });

const emit = defineEmits<{
  submit: [answers: QuestionnaireAnswers];
  skip: [];
  "update:state": [state: QuestionnaireState];
}>();
const attrs = useAttrs();

const base = "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const values = ref<Record<string, string[]>>({ ...props.defaultValues });
const other = ref<Record<string, string>>({ ...props.defaultOther });
const inner = ref<QuestionnaireState>(props.defaultState);
const current = computed(() => props.state ?? inner.value);
const done = computed(() => current.value !== "open");
const status = ref<HTMLParagraphElement | null>(null);
let finishedHere = false;

if (isDev() && !props.title && !props.label && !attrs["aria-label"] && !attrs["aria-labelledby"]) {
  console.warn("VinUI Questionnaire: pass a title or a label so the form has a name.");
}

// After Submit or Skip the buttons go away: move focus to the status line so keyboard users stay in place.
watch(done, (d) => {
  if (d && finishedHere) { finishedHere = false; nextTick(() => status.value?.focus()); }
});

function finish(next: QuestionnaireState) {
  finishedHere = true;
  inner.value = next;
  emit("update:state", next);
}

function toggle(q: Question, value: string, on: boolean) {
  const prev = values.value[q.id] ?? [];
  const next = q.multiple ? (on ? [...prev.filter((v) => v !== value), value] : prev.filter((v) => v !== value)) : [value];
  values.value = { ...values.value, [q.id]: next };
}
function setOther(q: Question, e: Event) {
  other.value = { ...other.value, [q.id]: (e.target as HTMLInputElement).value };
}

const answers = (): QuestionnaireAnswers =>
  Object.fromEntries(props.questions.map((q) => {
    // In the order the options are listed, like the form itself.
    const order = [...q.options.map((o) => norm(o).value), OTHER];
    const chosen = order.filter((v) => (values.value[q.id] ?? []).includes(v)).map((v) => (v === OTHER ? other.value[q.id]?.trim() || OTHER : v));
    return [q.id, q.multiple ? chosen : chosen[0] ?? ""];
  }));

function onSubmit() {
  if (done.value) return;
  emit("submit", answers());
  finish("submitted");
}
function onSkip() {
  emit("skip");
  finish("skipped");
}

const titleId = computed(() => (props.title ? `${base}-title` : undefined));
const statusText = computed(() =>
  current.value === "skipped" ? props.skippedText : props.submittedText ?? (props.questions.length > 1 ? "Answers sent" : "Answer sent"));
const optionsOf = (q: Question) =>
  q.other ? [...q.options.map(norm), { value: OTHER, label: typeof q.other === "string" ? q.other : "Other" }] : q.options.map(norm);
const inputId = (q: Question, value: string, i: number) => `${base}-${q.id}-${value === OTHER ? "other" : i}`;
</script>

<template>
  <form
    :aria-labelledby="titleId"
    :aria-label="titleId ? undefined : label"
    class="vin-questionnaire"
    :data-state="done ? current : undefined"
    @submit.prevent="onSubmit"
  >
    <div v-if="title != null" class="vin-questionnaire__header">
      <p class="vin-questionnaire__title" :id="titleId">{{ title }}</p>
      <p v-if="description != null" class="vin-questionnaire__description">{{ description }}</p>
    </div>
    <fieldset v-for="q in questions" :key="q.id" class="vin-questionnaire__question" :disabled="done">
      <legend class="vin-questionnaire__prompt">{{ q.prompt }}</legend>
      <p v-if="q.hint != null" class="vin-questionnaire__hint">{{ q.hint }}</p>
      <div v-for="(o, i) in optionsOf(q)" :key="o.value" class="vin-choice">
        <input
          :type="q.multiple ? 'checkbox' : 'radio'"
          :class="q.multiple ? 'vin-checkbox' : 'vin-radio'"
          :id="inputId(q, o.value, i)"
          :name="`${base}-${q.id}`"
          :value="o.value"
          :checked="(values[q.id] ?? []).includes(o.value)"
          @change="toggle(q, o.value, ($event.target as HTMLInputElement).checked)"
        />
        <div class="vin-choice__body">
          <label class="vin-choice__label" :for="inputId(q, o.value, i)">{{ o.label }}</label>
          <input
            v-if="o.value === 'other'"
            type="text"
            class="vin-input vin-input--sm vin-questionnaire__other"
            :name="`${base}-${q.id}-other`"
            aria-label="Other answer"
            :value="other[q.id] ?? ''"
            @input="setOther(q, $event)"
          />
        </div>
      </div>
    </fieldset>
    <div v-if="!done" class="vin-questionnaire__actions">
      <button v-if="skipLabel !== null" type="button" class="vin-btn vin-btn--ghost vin-btn--sm" @click="onSkip">{{ skipLabel }}</button>
      <button type="submit" class="vin-btn vin-btn--sm">{{ submitLabel }}</button>
    </div>
    <p v-else ref="status" class="vin-questionnaire__status" role="status" tabindex="-1">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <template v-if="current === 'skipped'"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></template>
        <template v-else><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></template>
      </svg>
      {{ statusText }}
    </p>
  </form>
</template>
