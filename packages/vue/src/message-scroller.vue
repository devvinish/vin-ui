<script lang="ts">
/*
 * VinUI · Message Scroller (Vue). API: spec/message-scroller.json.
 * A chat log that stays pinned to the newest message while you're at the bottom.
 * Scroll up and it stops following; a "Jump to latest" button brings you back.
 *   <MessageScroller outline style="height: 360px"><Message …/>…</MessageScroller>
 */
import { onBeforeUnmount, onMounted, ref } from "vue";

const reducedMotion = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || /^(reduced|off)$/.test(document.documentElement.getAttribute("data-vin-motion") ?? ""));
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Name for the log. Default: "Conversation". */
  label?: string;
  /** Draw a frame (surface, border, rounded corners). */
  outline?: boolean;
  /** Text of the jump button. Default: "Jump to latest". */
  jumpLabel?: string;
  /** How close to the bottom (px) still counts as "at the bottom". Default: 32. */
  threshold?: number;
  /** Attributes for the scrolling element (the log). */
  viewportProps?: Record<string, unknown>;
}>(), { label: "Conversation", jumpLabel: "Jump to latest", threshold: 32 });

const view = ref<HTMLDivElement | null>(null);
const content = ref<HTMLDivElement | null>(null);
let stuck = true;
let pinning = false;
const away = ref(false);
const fresh = ref(false);

const atBottom = () => {
  const v = view.value;
  return !v || v.scrollHeight - v.scrollTop - v.clientHeight <= props.threshold;
};
const toBottom = (smooth: boolean) => {
  const v = view.value;
  v?.scrollTo?.({ top: v.scrollHeight, behavior: smooth && !reducedMotion() ? "smooth" : "auto" });
};

let cleanup = () => {};
onMounted(() => {
  const v = view.value, c = content.value;
  if (!v || !c) return;
  toBottom(false);
  let lastTop = v.scrollTop;
  const onScroll = () => {
    // Only scrolling up lets go: content growing (or the browser re-anchoring it) never does.
    const top = v.scrollTop, bottom = atBottom(), up = top < lastTop - 1;
    lastTop = top;
    if (pinning) { if (!bottom) return; pinning = false; }
    if (bottom) { stuck = true; away.value = false; fresh.value = false; }
    else if (up) { stuck = false; away.value = true; }
  };
  const cancel = () => { pinning = false; };
  v.addEventListener("scroll", onScroll, { passive: true });
  v.addEventListener("wheel", cancel, { passive: true });
  v.addEventListener("touchstart", cancel, { passive: true });
  v.addEventListener("keydown", cancel);
  const ro = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver(() => {
      if (stuck || pinning) toBottom(pinning);
      else if (!atBottom()) { away.value = true; fresh.value = true; }
    })
    : null;
  ro?.observe(c);
  cleanup = () => {
    ro?.disconnect();
    v.removeEventListener("scroll", onScroll);
    v.removeEventListener("wheel", cancel);
    v.removeEventListener("touchstart", cancel);
    v.removeEventListener("keydown", cancel);
  };
});
onBeforeUnmount(() => cleanup());

function jump() {
  stuck = true;
  pinning = true;
  away.value = false;
  fresh.value = false;
  view.value?.focus({ preventScroll: true });
  toBottom(true);
}
</script>

<template>
  <div :class="['vin-message-scroller', outline && 'vin-message-scroller--outline']">
    <div
      role="log"
      aria-live="polite"
      :aria-label="label"
      tabindex="0"
      v-bind="viewportProps"
      ref="view"
      :class="['vin-message-scroller__viewport', viewportProps?.class]"
    >
      <div ref="content" class="vin-message-scroller__content"><slot /></div>
    </div>
    <button
      type="button"
      class="vin-btn vin-btn--secondary vin-btn--sm vin-message-scroller__jump"
      :hidden="!away"
      :data-new="(away && fresh) || undefined"
      @click="jump"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
      {{ jumpLabel }}
    </button>
  </div>
</template>
