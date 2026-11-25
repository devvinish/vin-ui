<script lang="ts">
/*
 * VinUI · Select (Vue). API: spec/select.json.
 * A custom select (WAI-ARIA select-only combobox). Focus stays on the button; the list opens in
 * the top layer, so parents with overflow: hidden never clip it.
 * Keys: ↑ ↓ Home End PageUp PageDown, Enter/Space to choose, Esc to close, type to jump.
 *   <Select v-model="framework" label="Framework" :options="['Astro', 'Nuxt']" name="framework" />
 * With a label, `class` and `style` go on the wrapper.
 */
import { computed, nextTick, ref, useAttrs, useId, watch } from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");

export type SelectOption = string | { value: string; label: string; disabled?: boolean };
const norm = (o: SelectOption) => (typeof o === "string" ? { value: o, label: o, disabled: false } : { disabled: false, ...o });
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  options: SelectOption[];
  /** The chosen value (v-model). */
  modelValue?: string;
  /** Chosen at first, when you don't use v-model. */
  defaultValue?: string;
  /** Visible label. Or use the #label slot. Without either, pass an aria-label. */
  label?: string;
  placeholder?: string;
  hint?: string;
  /** Error message. Also marks the select invalid. */
  error?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Form field name: adds a hidden input with the value. */
  name?: string;
  id?: string;
}>(), { modelValue: undefined, placeholder: "Select…", size: "md" });

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const slots = defineSlots<{ label?(): unknown; hint?(): unknown; error?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const items = computed(() => props.options.map(norm));
const base = props.id ?? "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const ids = { label: `${base}-label`, list: `${base}-list`, hint: `${base}-hint`, error: `${base}-error` };
const optionId = (i: number) => `${base}-opt-${i}`;
const inner = ref(props.defaultValue);
const current = computed(() => props.modelValue ?? inner.value);
const open = ref(false);
const active = ref(-1);
const trigger = ref<HTMLButtonElement | null>(null);
const list = ref<HTMLDivElement | null>(null);
const typed = { text: "", at: 0 };
const enabled = computed(() => items.value.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0));
const chosen = computed(() => items.value.find((o) => o.value === current.value));
const hasLabel = computed(() => !!(props.label || slots.label));
const hasHint = computed(() => !!(props.hint || slots.hint));
const hasError = computed(() => !!(props.error || slots.error));
const ariaLabel = computed(() => (hasLabel.value ? undefined : (attrs["aria-label"] as string | undefined)));

if (isDev() && !hasLabel.value && !attrs["aria-label"]) {
  console.warn("VinUI Select: pass a label or an aria-label.");
}

function choose(i: number) {
  const o = items.value[i];
  if (!o || o.disabled) return;
  inner.value = o.value;
  emit("update:modelValue", o.value);
}
function openList(which?: "first" | "last") {
  if (props.disabled) return;
  const en = enabled.value;
  const sel = items.value.findIndex((o) => o.value === current.value);
  active.value = which === "first" ? en[0] : which === "last" ? en[en.length - 1] : sel >= 0 && !items.value[sel].disabled ? sel : en[0];
  open.value = true;
}
function close() { open.value = false; active.value = -1; }

// Show the popover, place it under (or above) the button, and close on outside press.
watch(open, (isOpen, _was, onCleanup) => {
  const el = list.value, btn = trigger.value;
  if (!isOpen || !el || !btn) return;
  el.showPopover?.();
  const place = () => {
    const r = btn.getBoundingClientRect();
    el.style.minWidth = `${r.width}px`;
    el.style.left = `${r.left}px`;
    const below = window.innerHeight - r.bottom, h = el.offsetHeight;
    el.style.top = `${below < h + 8 && r.top > below ? r.top - h - 4 : r.bottom + 4}px`;
  };
  place();
  const outside = (e: PointerEvent) => { if (!btn.contains(e.target as Node) && !el.contains(e.target as Node)) close(); };
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
  if (open.value && active.value >= 0) nextTick(() => list.value?.children[active.value]?.scrollIntoView?.({ block: "nearest" }));
});

function move(step: number) {
  const en = enabled.value;
  const pos = en.indexOf(active.value);
  active.value = en[Math.min(en.length - 1, Math.max(0, pos + step))];
}
function typeahead(ch: string) {
  const now = Date.now();
  typed.text = now - typed.at > 600 ? ch : typed.text + ch;
  typed.at = now;
  const en = enabled.value;
  const from = open.value ? active.value : items.value.findIndex((o) => o.value === current.value);
  const start = en.indexOf(from) + (typed.text.length === 1 ? 1 : 0);
  const order = [...en.slice(start), ...en.slice(0, start)];
  const hit = order.find((i) => items.value[i].label.toLowerCase().startsWith(typed.text.toLowerCase()));
  if (hit === undefined) return;
  if (open.value) active.value = hit; else choose(hit);
}

function onKeydown(e: KeyboardEvent) {
  const k = e.key;
  const printable = k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
  const en = enabled.value;
  if (!open.value) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(k)) { e.preventDefault(); openList(); }
    else if (k === "Home") { e.preventDefault(); openList("first"); }
    else if (k === "End") { e.preventDefault(); openList("last"); }
    else if (printable) typeahead(k);
    return;
  }
  if (k === "ArrowDown") { e.preventDefault(); if (!e.altKey) move(1); }
  else if (k === "ArrowUp") { e.preventDefault(); if (e.altKey) { choose(active.value); close(); } else move(-1); }
  else if (k === "Home") { e.preventDefault(); active.value = en[0]; }
  else if (k === "End") { e.preventDefault(); active.value = en[en.length - 1]; }
  else if (k === "PageDown") { e.preventDefault(); move(10); }
  else if (k === "PageUp") { e.preventDefault(); move(-10); }
  else if (k === "Enter" || k === " ") { e.preventDefault(); choose(active.value); close(); }
  else if (k === "Escape") { e.preventDefault(); close(); }
  else if (k === "Tab") { choose(active.value); close(); }
  else if (printable) typeahead(k);
}
function onBlur() {
  setTimeout(() => { if (document.activeElement !== trigger.value) close(); }, 0);
}
function onOptionClick(i: number) {
  if (items.value[i].disabled) return;
  choose(i);
  close();
  trigger.value?.focus();
}
function onOptionMove(i: number) {
  if (!items.value[i].disabled && i !== active.value) active.value = i;
}
</script>

<template>
  <div v-if="hasLabel" :class="['vin-field', attrs.class]" :style="attrs.style">
    <span class="vin-label" :id="ids.label"><slot name="label">{{ label }}</slot></span>
    <div class="vin-select">
      <button
        ref="trigger"
        type="button"
        :id="base"
        role="combobox"
        :class="cx('vin-input', 'vin-select__trigger', size !== 'md' && `vin-input--${size}`)"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-controls="ids.list"
        :aria-labelledby="ids.label"
        :aria-invalid="hasError ? true : undefined"
        :aria-describedby="cx(hasError && ids.error, hasHint && ids.hint) || undefined"
        :aria-activedescendant="open && active >= 0 ? optionId(active) : undefined"
        :disabled="disabled"
        @click="open ? close() : openList()"
        @keydown="onKeydown"
        @blur="onBlur"
      >
        <span v-if="chosen" class="vin-select__value">{{ chosen.label }}</span>
        <span v-else class="vin-select__value" data-placeholder="">{{ placeholder }}</span>
      </button>
      <div ref="list" class="vin-select__content" role="listbox" :id="ids.list" popover="manual" tabindex="-1" :aria-labelledby="ids.label" @mousedown.prevent>
        <div
          v-for="(o, i) in items"
          :key="o.value"
          :id="optionId(i)"
          class="vin-select__item"
          role="option"
          :aria-selected="o.value === current"
          :aria-disabled="o.disabled || undefined"
          :data-value="o.value"
          :data-active="open && i === active ? '' : undefined"
          @pointermove="onOptionMove(i)"
          @click="onOptionClick(i)"
        >{{ o.label }}</div>
      </div>
      <input v-if="name" type="hidden" :name="name" :value="current ?? ''" />
    </div>
    <p v-if="hasError" class="vin-error" :id="ids.error"><slot name="error">{{ error }}</slot></p>
    <p v-if="hasHint" class="vin-hint" :id="ids.hint"><slot name="hint">{{ hint }}</slot></p>
  </div>
  <div v-else :class="['vin-select', attrs.class]" :style="attrs.style">
    <button
      ref="trigger"
      type="button"
      :id="base"
      role="combobox"
      :class="cx('vin-input', 'vin-select__trigger', size !== 'md' && `vin-input--${size}`)"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="ids.list"
      :aria-label="ariaLabel"
      :aria-invalid="hasError ? true : undefined"
      :aria-describedby="cx(hasError && ids.error, hasHint && ids.hint) || undefined"
      :aria-activedescendant="open && active >= 0 ? optionId(active) : undefined"
      :disabled="disabled"
      @click="open ? close() : openList()"
      @keydown="onKeydown"
      @blur="onBlur"
    >
      <span v-if="chosen" class="vin-select__value">{{ chosen.label }}</span>
      <span v-else class="vin-select__value" data-placeholder="">{{ placeholder }}</span>
    </button>
    <div ref="list" class="vin-select__content" role="listbox" :id="ids.list" popover="manual" tabindex="-1" :aria-label="ariaLabel" @mousedown.prevent>
      <div
        v-for="(o, i) in items"
        :key="o.value"
        :id="optionId(i)"
        class="vin-select__item"
        role="option"
        :aria-selected="o.value === current"
        :aria-disabled="o.disabled || undefined"
        :data-value="o.value"
        :data-active="open && i === active ? '' : undefined"
        @pointermove="onOptionMove(i)"
        @click="onOptionClick(i)"
      >{{ o.label }}</div>
    </div>
    <input v-if="name" type="hidden" :name="name" :value="current ?? ''" />
  </div>
</template>
