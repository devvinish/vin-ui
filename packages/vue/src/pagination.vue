<script lang="ts">
/*
 * VinUI · Pagination (Vue). API: spec/pagination.json.
 * With href, pages are links (good for SEO and new tabs). Without it, they're buttons and update:page is emitted.
 *   <Pagination :page="2" :count="10" :href="(p) => `?page=${p}`" />
 *   <Pagination v-model:page="page" :count="10" />
 */
import { computed, defineComponent, h, type PropType } from "vue";

/** Pages to show: first, last, and `siblings` either side of `page`, with "…" for gaps. */
export function pageRange(page: number, count: number, siblings = 1): (number | "…")[] {
  if (count <= 1) return [1];
  const start = Math.max(2, page - siblings);
  const end = Math.min(count - 1, page + siblings);
  const out: (number | "…")[] = [1];
  // A gap of one page shows that page instead of "…".
  if (start === 3) out.push(2); else if (start > 3) out.push("…");
  for (let p = start; p <= end; p++) out.push(p);
  if (end === count - 2) out.push(count - 1); else if (end < count - 2) out.push("…");
  out.push(count);
  return out;
}

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" };
const Left = () => h("svg", svg, [h("path", { d: "m15 6-6 6 6 6" })]);
const Right = () => h("svg", svg, [h("path", { d: "m9 6 6 6-6 6" })]);

/** One page control: a link when there's an href, otherwise a button. */
const Go = defineComponent({
  props: {
    to: { type: Number, required: true },
    count: { type: Number, required: true },
    href: Function as PropType<(page: number) => string>,
    onGo: Function as PropType<(page: number) => void>,
  },
  setup: (props, { slots }) => () => {
    const disabled = props.to < 1 || props.to > props.count;
    if (props.href) {
      return disabled
        ? h("a", { role: "link", "aria-disabled": "true" }, slots.default?.())
        : h("a", { href: props.href(props.to) }, slots.default?.());
    }
    return h("button", { type: "button", disabled, onClick: () => props.onGo?.(props.to) }, slots.default?.());
  },
});
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  page: number;
  count: number;
  /** Makes pages links: (page) => url. */
  href?: (page: number) => string;
  siblings?: number;
  /** "Previous" and "Next" as words. */
  labels?: boolean;
  /** Previous, "Page 2 of 10", Next. */
  simple?: boolean;
}>(), { siblings: 1 });

const emit = defineEmits<{ "update:page": [page: number] }>();
const go = (p: number) => emit("update:page", p);
const edge = computed(() => (props.simple ? "vin-btn vin-btn--outline vin-btn--sm" : props.labels ? "vin-btn vin-btn--ghost" : "vin-btn vin-btn--ghost vin-btn--icon"));
const words = computed(() => props.simple || props.labels);
</script>

<template>
  <nav aria-label="Pagination" class="vin-pagination">
    <ul class="vin-pagination__list">
      <li>
        <Go :to="page - 1" :count="count" :href="href" :on-go="go" :class="edge" :aria-label="words ? undefined : 'Previous page'">
          <Left /><template v-if="words"> Previous</template>
        </Go>
      </li>
      <li v-if="simple"><span class="vin-pagination__status">Page {{ page }} of {{ count }}</span></li>
      <template v-else>
        <li v-for="(p, i) in pageRange(page, count, siblings)" :key="i">
          <span v-if="p === '…'" class="vin-pagination__ellipsis" aria-hidden="true">…</span>
          <Go v-else-if="p === page" :to="p" :count="count" :href="href" :on-go="go" class="vin-btn vin-btn--outline vin-pagination__page" aria-current="page">{{ p }}</Go>
          <Go v-else :to="p" :count="count" :href="href" :on-go="go" class="vin-btn vin-btn--ghost vin-pagination__page">{{ p }}</Go>
        </li>
      </template>
      <li>
        <Go :to="page + 1" :count="count" :href="href" :on-go="go" :class="edge" :aria-label="words ? undefined : 'Next page'">
          <template v-if="words">Next </template><Right />
        </Go>
      </li>
    </ul>
  </nav>
</template>
