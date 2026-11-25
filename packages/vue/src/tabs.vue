<script lang="ts">
/*
 * VinUI · Tabs (Vue). API: spec/tabs.json.
 * WAI-ARIA tabs: arrow keys move between tabs, Home/End jump, panels are linked by id.
 *   import Tabs, { TabList, Tab, TabPanel } from "@/components/vin/tabs.vue";
 *   <Tabs v-model="tab" default-value="account">
 *     <TabList aria-label="Account settings"><Tab value="account">Account</Tab>…</TabList>
 *     <TabPanel value="account">…</TabPanel>
 *   </Tabs>
 */
import { computed, defineComponent, h, inject, provide, ref, useId, type ComputedRef, type InjectionKey } from "vue";

type Ctx = { value: ComputedRef<string>; select: (v: string) => void; base: string };
const TabsKey: InjectionKey<Ctx> = Symbol("VinTabs");
const useTabs = (part: string) => {
  const ctx = inject(TabsKey, null);
  if (!ctx) throw new Error(`VinUI: <${part}> must be inside <Tabs>.`);
  return ctx;
};
const safe = (v: string) => v.replace(/[^a-zA-Z0-9_-]/g, "-");

/** The row of tabs. Give it an aria-label that names the group. */
export const TabList = defineComponent({
  name: "TabList",
  setup: (_, { slots }) => {
    const onKeydown = (e: KeyboardEvent) => {
      const list = e.currentTarget as HTMLElement;
      const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')];
      const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
      if (i < 0) return;
      const rtl = getComputedStyle(list).direction === "rtl";
      const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
      const target = step ? tabs[(i + step + tabs.length) % tabs.length] : e.key === "Home" ? tabs[0] : e.key === "End" ? tabs[tabs.length - 1] : null;
      if (target) { e.preventDefault(); target.focus(); target.click(); }
    };
    return () => h("div", { role: "tablist", class: "vin-tabs__list", onKeydown }, slots.default?.());
  },
});

export const Tab = defineComponent({
  name: "Tab",
  props: { value: { type: String, required: true } },
  emits: { click: (_e: MouseEvent) => true },
  setup: (props, { slots, emit }) => {
    const ctx = useTabs("Tab");
    return () => {
      const on = ctx.value.value === props.value;
      return h(
        "button",
        {
          type: "button",
          role: "tab",
          id: `${ctx.base}-tab-${safe(props.value)}`,
          "aria-selected": on,
          "aria-controls": `${ctx.base}-panel-${safe(props.value)}`,
          tabindex: on ? 0 : -1,
          class: "vin-tabs__tab",
          onClick: (e: MouseEvent) => { emit("click", e); if (!e.defaultPrevented) ctx.select(props.value); },
        },
        slots.default?.(),
      );
    };
  },
});

export const TabPanel = defineComponent({
  name: "TabPanel",
  props: { value: { type: String, required: true } },
  setup: (props, { slots }) => {
    const ctx = useTabs("TabPanel");
    return () =>
      h(
        "div",
        {
          role: "tabpanel",
          id: `${ctx.base}-panel-${safe(props.value)}`,
          "aria-labelledby": `${ctx.base}-tab-${safe(props.value)}`,
          tabindex: 0,
          hidden: ctx.value.value !== props.value,
          class: "vin-tabs__panel",
        },
        slots.default?.(),
      );
  },
});
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** The open tab (v-model). */
  modelValue?: string;
  /** The tab open at first, when you don't use v-model. */
  defaultValue?: string;
  /** "segmented" (default) or "line" (underline). */
  variant?: "segmented" | "line";
}>(), { modelValue: undefined, defaultValue: "", variant: "segmented" });

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const inner = ref(props.defaultValue);
const current = computed(() => props.modelValue ?? inner.value);

provide(TabsKey, {
  value: current,
  base: "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, ""),
  select: (v) => { inner.value = v; emit("update:modelValue", v); },
});
</script>

<template>
  <div :class="['vin-tabs', variant === 'line' && 'vin-tabs--line']"><slot /></div>
</template>
