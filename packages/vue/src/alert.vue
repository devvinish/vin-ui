<script lang="ts">
/*
 * VinUI · Alert (Vue). API: spec/alert.json.
 * Each variant has a built-in icon. Listen to @dismiss for a close button; focus then moves to the next control.
 *   <Alert variant="warning" title="Storage almost full" @dismiss="open = false">…<template #actions>…</template></Alert>
 */
import { Comment, cloneVNode, ref, type FunctionalComponent, type VNode } from "vue";

type Variant = "neutral" | "primary" | "success" | "warning" | "danger";

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" } as const;
const INFO = ["M12 11v5", "M12 8h.01"];
const PATHS: Record<Variant, { circle: boolean; d: string[] }> = {
  neutral: { circle: true, d: INFO },
  primary: { circle: true, d: INFO },
  success: { circle: true, d: ["m8.5 12 2.5 2.5 4.5-5"] },
  warning: { circle: false, d: ["M10.3 4.2 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z", "M12 9.5v4", "M12 17h.01"] },
  danger: { circle: true, d: ["M12 7.5v5", "M12 16h.01"] },
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: Variant;
  /** Or use the #title slot. */
  title?: string;
  /** false hides the icon. Use the #icon slot for your own. Default: the variant's icon. */
  icon?: boolean;
  /** The close button's name. Default: "Dismiss". */
  dismissLabel?: string;
  /** Listening to @dismiss shows a close button. Remove the alert in the handler. */
  onDismiss?: () => void;
}>(), { variant: "neutral", icon: true, dismissLabel: "Dismiss" });

const slots = defineSlots<{ default?(): unknown; title?(): unknown; icon?(): VNode[]; actions?(): unknown }>();
const box = ref<HTMLDivElement | null>(null);

/** Your own icon gets the vin-alert__icon class. */
const CustomIcon: FunctionalComponent = () =>
  (slots.icon?.() ?? []).filter((n) => n.type !== Comment).map((n) => cloneVNode(n, { class: "vin-alert__icon" }));

function dismiss() {
  const el = box.value;
  if (el && el.contains(document.activeElement)) {
    // Focus the next control after the alert (or the one before it), so keyboard users stay in place.
    const all = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => !el.contains(x));
    const after = all.filter((x) => el.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING);
    (after[0] ?? all[all.length - after.length - 1])?.focus();
  }
  props.onDismiss?.();
}
</script>

<template>
  <div ref="box" :class="['vin-alert', variant !== 'neutral' && `vin-alert--${variant}`]">
    <CustomIcon v-if="slots.icon" />
    <svg v-else-if="icon" v-bind="svg" class="vin-alert__icon">
      <circle v-if="PATHS[variant].circle" cx="12" cy="12" r="9" />
      <path v-for="d in PATHS[variant].d" :key="d" :d="d" />
    </svg>
    <div class="vin-alert__content">
      <p v-if="title != null || slots.title" class="vin-alert__title"><slot name="title">{{ title }}</slot></p>
      <p v-if="slots.default" class="vin-alert__description"><slot /></p>
      <div v-if="slots.actions" class="vin-alert__actions"><slot name="actions" /></div>
    </div>
    <button v-if="onDismiss" type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-alert__close" :aria-label="dismissLabel" @click="dismiss">
      <svg v-bind="svg"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    </button>
  </div>
</template>
