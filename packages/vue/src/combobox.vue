<script lang="ts">
/*
 * VinUI · Combobox (Vue). API: spec/combobox.json.
 * A text field that filters a list (WAI-ARIA combobox with list autocomplete). Focus stays in the
 * input; the list opens in the top layer. Options use Select's classes, so they look the same.
 *   <Combobox v-model="framework" label="Framework" :options="frameworks" name="framework" />
 * With a label, `class` and `style` go on the wrapper.
 */
import { computed, h, nextTick, ref, useAttrs, useId, watch, type FunctionalComponent } from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export type ComboboxOption = string | { value: string; label: string; disabled?: boolean; group?: string };
export type ComboboxItem = { value: string; label: string; disabled: boolean; group?: string };
const norm = (o: ComboboxOption): ComboboxItem => (typeof o === "string" ? { value: o, label: o, disabled: false } : { disabled: false, ...o });
const defaultFilter = (o: ComboboxItem, q: string) => fold(o.label).includes(fold(q.trim()));

/** Renders its children as they are (used when there's no field wrapper). */
const Pass: FunctionalComponent = (_, { slots }) => slots.default?.();
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  options: ComboboxOption[];
  /** The chosen value (v-model). */
  modelValue?: string;
  /** Chosen at first, when you don't use v-model. */
  defaultValue?: string;
  /** Visible label. Or use the #label slot. Without either, pass an aria-label. */
  label?: string;
  placeholder?: string;
  /** Shown when nothing matches. Or use the #empty slot. */
  emptyText?: string;
  /** Your own matching. The default matches any part of the label, ignoring case and accents. */
  filter?: (option: ComboboxItem, query: string) => boolean;
  hint?: string;
  /** Error message. Also marks the field invalid. */
  error?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Form field name: adds a hidden input with the value. */
  name?: string;
  id?: string;
}>(), { modelValue: undefined, placeholder: "Search…", emptyText: "No results.", size: "md" });

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const slots = defineSlots<{ label?(): unknown; hint?(): unknown; error?(): unknown; empty?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const items = computed(() => props.options.map(norm));
const matches = (o: ComboboxItem, q: string) => (props.filter ?? defaultFilter)(o, q);
const base = props.id ?? "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const ids = { list: `${base}-list`, hint: `${base}-hint`, error: `${base}-error` };
const optionId = (i: number) => `${base}-opt-${i}`;
const inner = ref(props.defaultValue);
const current = computed(() => props.modelValue ?? inner.value);
const chosen = computed(() => items.value.find((o) => o.value === current.value));
const text = ref(chosen.value?.label ?? "");
const query = ref<string | null>(null); // null: not filtering, show everything
const open = ref(false);
const active = ref(-1);
const input = ref<HTMLInputElement | null>(null);
const panel = ref<HTMLDivElement | null>(null);

const hasLabel = computed(() => !!(props.label || slots.label));
const hasHint = computed(() => !!(props.hint || slots.hint));
const hasError = computed(() => !!(props.error || slots.error));
if (isDev() && !hasLabel.value && !attrs["aria-label"]) console.warn("VinUI Combobox: pass a label or an aria-label.");

// Keep the text in step with a value changed from outside.
watch(() => chosen.value?.label, (l) => { if (query.value === null) text.value = l ?? ""; });

const shown = computed(() => items.value.map((o, i) => (query.value === null || matches(o, query.value) ? i : -1)).filter((i) => i >= 0));
const enabled = computed(() => shown.value.filter((i) => !items.value[i].disabled));

function setValue(v: string | undefined) { inner.value = v; emit("update:modelValue", v ?? ""); }
function choose(i: number) {
  const o = items.value[i];
  if (!o || o.disabled) return;
  setValue(o.value);
  text.value = o.label;
  query.value = null;
}
const restore = () => { text.value = chosen.value?.label ?? ""; query.value = null; };
const close = () => { open.value = false; active.value = -1; };
function openList(which?: "first" | "last" | "none", list = enabled.value) {
  if (props.disabled) return;
  const sel = items.value.findIndex((o) => o.value === current.value);
  active.value = which === "first" ? list[0] ?? -1 : which === "last" ? list[list.length - 1] ?? -1 : which === "none" ? -1 : list.includes(sel) ? sel : list[0] ?? -1;
  open.value = true;
}

// Show the panel under (or above) the input, and close on outside press.
watch(open, (isOpen, _was, onCleanup) => {
  const el = panel.value, field = input.value;
  if (!isOpen || !el || !field) return;
  el.showPopover?.();
  const place = () => {
    const r = field.getBoundingClientRect();
    el.style.minWidth = `${r.width}px`;
    el.style.left = `${r.left}px`;
    const below = window.innerHeight - r.bottom, h = el.offsetHeight;
    el.style.top = `${below < h + 8 && r.top > below ? r.top - h - 4 : r.bottom + 4}px`;
  };
  place();
  const outside = (e: PointerEvent) => {
    if (!field.contains(e.target as Node) && !el.contains(e.target as Node)) { close(); restore(); }
  };
  window.addEventListener("scroll", place, true);
  window.addEventListener("resize", place);
  document.addEventListener("pointerdown", outside, true);
  onCleanup(() => {
    window.removeEventListener("scroll", place, true);
    window.removeEventListener("resize", place);
    document.removeEventListener("pointerdown", outside, true);
    if (el.matches(":popover-open")) el.hidePopover?.();
  });
}, { flush: "post" });

watch([open, active], () => {
  if (open.value && active.value >= 0) nextTick(() => document.getElementById(optionId(active.value))?.scrollIntoView?.({ block: "nearest" }));
});

function move(step: number) {
  const en = enabled.value;
  const pos = en.indexOf(active.value);
  active.value = pos < 0 ? en[step > 0 ? 0 : en.length - 1] ?? -1 : en[Math.min(en.length - 1, Math.max(0, pos + step))];
}

function onInput(e: Event) {
  const q = (e.target as HTMLInputElement).value;
  text.value = q;
  query.value = q;
  const list = items.value.map((o, i) => (!o.disabled && matches(o, q) ? i : -1)).filter((i) => i >= 0);
  openList("first", list);
}
function onKeydown(e: KeyboardEvent) {
  const k = e.key;
  if (k === "ArrowDown" || k === "ArrowUp") {
    e.preventDefault();
    if (!open.value) {
      const list = query.value === null ? items.value.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0) : enabled.value;
      openList(e.altKey ? "none" : k === "ArrowUp" ? "last" : undefined, list);
    } else if (!e.altKey) move(k === "ArrowDown" ? 1 : -1);
    return;
  }
  if (!open.value) {
    if (k === "Escape" && text.value) {
      e.preventDefault();
      setValue(undefined);
      text.value = "";
      query.value = null;
    }
    return;
  }
  if (k === "PageDown" || k === "PageUp") { e.preventDefault(); move(k === "PageDown" ? 10 : -10); }
  else if (k === "Enter") { e.preventDefault(); if (active.value >= 0) choose(active.value); close(); }
  else if (k === "Escape") { e.preventDefault(); close(); restore(); }
  else if (k === "Tab") { if (active.value >= 0 && query.value !== null) choose(active.value); close(); }
}
function onBlur() {
  setTimeout(() => { if (document.activeElement !== input.value) { close(); restore(); } }, 0);
}
function onOptionClick(i: number) {
  if (items.value[i].disabled) return;
  choose(i);
  close();
  input.value?.focus();
}
function onOptionMove(i: number) {
  if (!items.value[i].disabled && i !== active.value) active.value = i;
}

// Options in order; consecutive options with the same group go under one heading.
const blocks = computed(() => {
  const out: { group?: string; idx: number[] }[] = [];
  items.value.forEach((o, i) => {
    const last = out[out.length - 1];
    if (last && last.group === o.group) last.idx.push(i);
    else out.push({ group: o.group, idx: [i] });
  });
  return out;
});
const wrapAttrs = computed(() => (hasLabel.value ? { class: ["vin-field", attrs.class], style: attrs.style } : {}));

/** One option. */
const Option: FunctionalComponent<{ i: number }> = ({ i }) => {
  const o = items.value[i];
  return h("div", {
    id: optionId(i),
    class: "vin-select__item",
    role: "option",
    "aria-selected": o.value === current.value,
    "aria-disabled": o.disabled || undefined,
    "data-value": o.value,
    "data-active": open.value && i === active.value ? "" : undefined,
    hidden: !shown.value.includes(i) || undefined,
    onPointermove: () => onOptionMove(i),
    onClick: () => onOptionClick(i),
  }, o.label);
};
Option.props = ["i"];
</script>

<template>
  <component :is="hasLabel ? 'div' : Pass" v-bind="wrapAttrs">
    <label v-if="hasLabel" class="vin-label" :for="base"><slot name="label">{{ label }}</slot></label>
    <div :class="['vin-combobox', !hasLabel && attrs.class]" :style="hasLabel ? undefined : attrs.style">
      <input
        ref="input"
        :id="base"
        :class="cx('vin-input', 'vin-combobox__input', size !== 'md' && `vin-input--${size}`)"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="open"
        :aria-controls="ids.list"
        :aria-label="hasLabel ? undefined : attrs['aria-label']"
        :aria-invalid="hasError ? true : undefined"
        :aria-describedby="cx(hasError && ids.error, hasHint && ids.hint) || undefined"
        :aria-activedescendant="open && active >= 0 ? optionId(active) : undefined"
        autocomplete="off"
        :placeholder="placeholder"
        :value="text"
        :disabled="disabled"
        @input="onInput"
        @click="open ? close() : openList()"
        @keydown="onKeydown"
        @blur="onBlur"
      />
      <div ref="panel" class="vin-select__content vin-combobox__content" popover="manual" @mousedown.prevent>
        <div :id="ids.list" role="listbox" :aria-label="label ?? attrs['aria-label']">
          <template v-for="(b, n) in blocks" :key="n">
            <template v-if="b.group === undefined"><Option v-for="i in b.idx" :key="items[i].value" :i="i" /></template>
            <div
              v-else
              class="vin-combobox__group"
              role="group"
              :aria-labelledby="`${base}-g${n}`"
              :hidden="!b.idx.some((i) => shown.includes(i)) || undefined"
            >
              <div class="vin-combobox__label" :id="`${base}-g${n}`" role="presentation">{{ b.group }}</div>
              <Option v-for="i in b.idx" :key="items[i].value" :i="i" />
            </div>
          </template>
        </div>
        <p class="vin-combobox__empty" role="status" :hidden="shown.length > 0 || undefined"><slot name="empty">{{ emptyText }}</slot></p>
      </div>
      <input v-if="name" type="hidden" :name="name" :value="current ?? ''" />
    </div>
    <p v-if="hasLabel && hasError" class="vin-error" :id="ids.error"><slot name="error">{{ error }}</slot></p>
    <p v-if="hasLabel && hasHint" class="vin-hint" :id="ids.hint"><slot name="hint">{{ hint }}</slot></p>
  </component>
</template>
