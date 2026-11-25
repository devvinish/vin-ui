<script lang="ts">
/*
 * VinUI · Input OTP (Vue). API: spec/input-otp.json.
 * One real <input autocomplete="one-time-code">, drawn as separate boxes. Paste, SMS autofill,
 * password managers and screen readers all see a normal text field.
 *   <InputOTP v-model="code" label="Verification code" :groups="[3, 3]" @complete="verify" />
 * With a label, `class` and `style` go on the wrapper; other attributes go on the input.
 */
import { computed, ref, useAttrs, useId } from "vue";

const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Number of characters. Default: 6. */
  length?: number;
  /** Split the boxes into groups, e.g. [3, 3]. Default: one group. */
  groups?: number[];
  /** The code (v-model). */
  modelValue?: string;
  /** The starting code, when you don't use v-model. */
  defaultValue?: string;
  /** "numeric" (default) or "alphanumeric". */
  charset?: "numeric" | "alphanumeric";
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}>(), { length: 6, modelValue: undefined, defaultValue: "", charset: "numeric" });

const emit = defineEmits<{
  "update:modelValue": [value: string];
  /** Every box is filled. */
  complete: [value: string];
}>();
const slots = defineSlots<{ label?(): unknown; hint?(): unknown; error?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const auto = "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const inputId = computed(() => props.id ?? auto);
const inner = ref(props.defaultValue);
const focused = ref(false);
const current = computed(() => (props.modelValue ?? inner.value).slice(0, props.length));
const hasLabel = computed(() => !!(props.label || slots.label));
const hasHint = computed(() => !!(props.hint || slots.hint));
const hasError = computed(() => !!(props.error || slots.error));

/** Each box: its group, whether a separator comes first, its index. */
const boxes = computed(() => {
  const out: { i: number; sep: boolean }[] = [];
  let n = 0;
  (props.groups ?? [props.length]).forEach((count, g) => {
    for (let k = 0; k < count; k++) out.push({ i: n++, sep: g > 0 && k === 0 });
  });
  return out;
});

const atEnd = (el: HTMLInputElement) => requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
function onInput(e: Event) {
  const el = e.target as HTMLInputElement;
  const re = props.charset === "numeric" ? /\D/g : /[^a-z0-9]/gi;
  const next = el.value.replace(re, "").slice(0, props.length);
  const before = current.value;
  if (el.value !== next) el.value = next;
  inner.value = next;
  emit("update:modelValue", next);
  if (next.length === props.length && before.length !== props.length) emit("complete", next);
}

function inputAttrs() {
  const { class: _c, style: _s, onFocus, onBlur, ...rest } = attrs;
  return {
    ...rest,
    id: inputId.value,
    "aria-invalid": hasError.value ? true : rest["aria-invalid"],
    "aria-describedby": cx(rest["aria-describedby"], hasError.value && `${inputId.value}-error`, hasHint.value && `${inputId.value}-hint`) || undefined,
    onFocus: (e: FocusEvent) => { focused.value = true; atEnd(e.target as HTMLInputElement); onFocus?.(e); },
    onBlur: (e: FocusEvent) => { focused.value = false; onBlur?.(e); },
  };
}
</script>

<template>
  <div v-if="!hasLabel" :class="['vin-otp', attrs.class]" :style="attrs.style">
    <input
      v-bind="inputAttrs()"
      class="vin-otp__input"
      type="text"
      :inputmode="charset === 'numeric' ? 'numeric' : 'text'"
      autocomplete="one-time-code"
      :pattern="charset === 'numeric' ? '[0-9]*' : '[A-Za-z0-9]*'"
      :maxlength="length"
      :value="current"
      @input="onInput"
      @click="atEnd($event.target as HTMLInputElement)"
      @keyup="atEnd($event.target as HTMLInputElement)"
    />
    <div class="vin-otp__slots" aria-hidden="true">
      <template v-for="b in boxes" :key="b.i">
        <span v-if="b.sep" class="vin-otp__sep" />
        <span class="vin-input vin-otp__slot" :data-active="focused && b.i === Math.min(current.length, length - 1) ? '' : undefined">{{ current[b.i] ?? "" }}</span>
      </template>
    </div>
  </div>
  <div v-else :class="['vin-field', attrs.class]" :style="attrs.style">
    <label class="vin-label" :for="inputId"><slot name="label">{{ label }}</slot></label>
    <div class="vin-otp">
      <input
        v-bind="inputAttrs()"
        class="vin-otp__input"
        type="text"
        :inputmode="charset === 'numeric' ? 'numeric' : 'text'"
        autocomplete="one-time-code"
        :pattern="charset === 'numeric' ? '[0-9]*' : '[A-Za-z0-9]*'"
        :maxlength="length"
        :value="current"
        @input="onInput"
        @click="atEnd($event.target as HTMLInputElement)"
        @keyup="atEnd($event.target as HTMLInputElement)"
      />
      <div class="vin-otp__slots" aria-hidden="true">
        <template v-for="b in boxes" :key="b.i">
          <span v-if="b.sep" class="vin-otp__sep" />
          <span class="vin-input vin-otp__slot" :data-active="focused && b.i === Math.min(current.length, length - 1) ? '' : undefined">{{ current[b.i] ?? "" }}</span>
        </template>
      </div>
    </div>
    <p v-if="hasError" class="vin-error" :id="`${inputId}-error`"><slot name="error">{{ error }}</slot></p>
    <p v-if="hasHint" class="vin-hint" :id="`${inputId}-hint`"><slot name="hint">{{ hint }}</slot></p>
  </div>
</template>
