<script lang="ts">
/*
 * VinUI · Toggle Group (Vue). API: spec/toggle-group.json.
 * type="single": one choice (a radio group of toggles). type="multiple": any number pressed.
 * One Tab stop for the whole group; arrow keys move between items.
 *   import ToggleGroup, { ToggleGroupItem } from "@/components/vin/toggle-group.vue";
 *   <ToggleGroup v-model="view" type="single" aria-label="View"><ToggleGroupItem value="list">List</ToggleGroupItem>…</ToggleGroup>
 */
import {
  computed, defineComponent, getCurrentInstance, h, inject, onBeforeUnmount, provide, reactive, ref, watch,
  type InjectionKey,
} from "vue";

type Size = "sm" | "md" | "lg" | "icon";
type Ctx = {
  single: () => boolean;
  isOn: (v: string) => boolean;
  toggle: (v: string) => void;
  /** The item that is the Tab stop. */
  stop: () => string | undefined;
  size: () => Size | undefined;
  register: (uid: number, item: { value: string; disabled: boolean }) => void;
  unregister: (uid: number) => void;
};
const GroupKey: InjectionKey<Ctx> = Symbol("VinToggleGroup");

export const ToggleGroupItem = defineComponent({
  name: "ToggleGroupItem",
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  emits: { click: (_e: MouseEvent) => true },
  setup(props, { slots, emit }) {
    const ctx = inject(GroupKey, null);
    if (!ctx) throw new Error("VinUI: <ToggleGroupItem> must be inside <ToggleGroup>.");
    const uid = getCurrentInstance()!.uid;
    // Items register in render order, so the group knows the first one (the Tab stop when nothing is on).
    const entry = reactive({ value: props.value, disabled: props.disabled });
    watch(() => [props.value, props.disabled] as const, ([value, disabled]) => { entry.value = value; entry.disabled = disabled; });
    ctx.register(uid, entry);
    onBeforeUnmount(() => ctx.unregister(uid));
    return () => {
      const on = ctx.isOn(props.value);
      const single = ctx.single();
      const size = ctx.size();
      return h(
        "button",
        {
          type: "button",
          "data-value": props.value,
          role: single ? "radio" : undefined,
          "aria-checked": single ? on : undefined,
          "aria-pressed": single ? undefined : on,
          tabindex: ctx.stop() === props.value ? 0 : -1,
          disabled: props.disabled,
          class: ["vin-toggle", size && size !== "md" && `vin-toggle--${size}`],
          onClick: (e: MouseEvent) => { emit("click", e); if (!e.defaultPrevented) ctx.toggle(props.value); },
        },
        slots.default?.(),
      );
    };
  },
});

export type ToggleGroupItemProps = { value: string; disabled?: boolean };
export type { Size as ToggleGroupSize };
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** "single": one choice; "multiple": any number pressed. */
  type: "single" | "multiple";
  /** The pressed value(s) (v-model): a string for "single", an array for "multiple". */
  modelValue?: string | string[];
  /** Pressed at first, when you don't use v-model. */
  defaultValue?: string | string[];
  variant?: "default" | "outline";
  /** Size for every item. */
  size?: Size;
}>(), { modelValue: undefined, variant: "default" });

const emit = defineEmits<{ "update:modelValue": [value: string | string[]] }>();

const toList = (v: string | string[] | undefined) => (v === undefined || v === "" ? [] : Array.isArray(v) ? v : [v]);
const single = computed(() => props.type === "single");
const inner = ref<string[]>(toList(props.defaultValue));
const current = computed(() => (props.modelValue !== undefined ? toList(props.modelValue) : inner.value));
const focusValue = ref<string>();
const items = reactive(new Map<number, { value: string; disabled: boolean }>());

function toggle(v: string) {
  const cur = current.value;
  const next = single.value ? [v] : cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
  inner.value = next;
  focusValue.value = v;
  emit("update:modelValue", single.value ? next[0] ?? "" : next);
}

provide(GroupKey, {
  single: () => single.value,
  isOn: (v) => current.value.includes(v),
  toggle,
  stop: () => focusValue.value ?? current.value[0] ?? [...items.values()].find((i) => !i.disabled)?.value,
  size: () => props.size,
  register: (uid, item) => items.set(uid, item),
  unregister: (uid) => items.delete(uid),
});

function onKeydown(e: KeyboardEvent) {
  const group = e.currentTarget as HTMLElement;
  const all = [...group.querySelectorAll<HTMLButtonElement>(".vin-toggle:not(:disabled)")];
  const i = all.indexOf(document.activeElement as HTMLButtonElement);
  if (i < 0) return;
  const rtl = getComputedStyle(group).direction === "rtl";
  const step = ({ ArrowRight: rtl ? -1 : 1, ArrowDown: 1, ArrowLeft: rtl ? 1 : -1, ArrowUp: -1 } as Record<string, number>)[e.key];
  const target = step ? all[(i + step + all.length) % all.length] : e.key === "Home" ? all[0] : e.key === "End" ? all[all.length - 1] : null;
  if (!target) return;
  e.preventDefault();
  target.focus();
  const v = target.dataset.value!;
  if (single.value) toggle(v); else focusValue.value = v;
}
</script>

<template>
  <div
    :role="single ? 'radiogroup' : 'group'"
    :class="['vin-toggle-group', variant === 'outline' && 'vin-toggle-group--outline']"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>
