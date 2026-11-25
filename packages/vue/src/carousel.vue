<script lang="ts">
/*
 * VinUI · Carousel (Vue). API: spec/carousel.json.
 *   <Carousel label="Featured stays"><StayCard v-for="s in stays" :key="s.id" v-bind="s" /></Carousel>
 * Each child of the default slot is a slide. The track is a native scroll-snap scroller (touch and
 * trackpads just work); the buttons, dots and arrow keys scroll it. No autoplay. Slides that are
 * out of view are inert.
 */
import {
  Comment, Fragment, Text, defineComponent, h, onBeforeUnmount, onMounted, ref, useId, watch, type VNode,
} from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

const chevron = (d: string) =>
  h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, [h("path", { d })]);

/** Slot children with fragments (v-for, templates) opened up, and comments and blank text dropped. */
function flatten(nodes: VNode[] | undefined): VNode[] {
  return (nodes ?? []).flatMap((n) =>
    n.type === Fragment ? flatten(n.children as VNode[])
      : n.type === Comment || (n.type === Text && !String(n.children).trim()) ? [] : [n]);
}

/** Is motion reduced, by the OS or by Customize → Motion? */
function reducedMotion(el: Element) {
  if (el.closest('[data-vin-motion="off"], [data-vin-motion="reduced"]')) return true;
  return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches && !el.closest('[data-vin-motion="full"]');
}

const Carousel = defineComponent({
  name: "Carousel",
  props: {
    /** Names the carousel. */
    label: { type: String, required: true as const },
    /** Slides shown at once; fractions show a peek. Default 1. */
    perView: { type: Number, default: undefined },
    /** Space between slides, e.g. "16px". Default 12px. */
    gap: { type: String, default: undefined },
    /** A dot per slide. Default true. */
    dots: { type: Boolean, default: true },
    /** Previous and next buttons. Default true. */
    controls: { type: Boolean, default: true },
  },
  emits: { /** The first fully shown slide (0-based). */ "slide-change": (_index: number) => true },
  setup(props, { emit, slots }) {
    const id = "vin-carousel-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const track = ref<HTMLDivElement | null>(null);
    const current = ref(0);
    const shown = ref<boolean[] | null>(null);
    const edges = ref({ start: true, end: false });
    // How many slides the last render had (goTo clamps to it).
    let count = 0;
    if (isDev() && !props.label) console.warn('VinUI Carousel: pass a label, e.g. label="Featured stays".');

    function measure() {
      const t = track.value;
      if (!t) return;
      const box = t.getBoundingClientRect();
      const vis = (Array.from(t.children) as HTMLElement[]).map((s) => {
        const r = s.getBoundingClientRect();
        return Math.min(r.right, box.right) - Math.max(r.left, box.left) >= r.width * 0.5 - 1;
      });
      const max = t.scrollWidth - t.clientWidth, pos = Math.abs(t.scrollLeft);
      const old = shown.value;
      if (!(old && old.length === vis.length && old.every((v, i) => v === vis[i]))) shown.value = vis;
      const next = { start: pos <= 1, end: pos >= max - 1 };
      if (edges.value.start !== next.start || edges.value.end !== next.end) edges.value = next;
      current.value = Math.max(0, vis.indexOf(true));
    }
    watch(current, (i) => emit("slide-change", i));

    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    let ro: ResizeObserver | null = null;
    onMounted(() => {
      const t = track.value!;
      measure();
      t.addEventListener("scroll", schedule, { passive: true });
      ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
      ro?.observe(t);
    });
    onBeforeUnmount(() => { cancelAnimationFrame(frame); track.value?.removeEventListener("scroll", schedule); ro?.disconnect(); });

    function goTo(i: number) {
      const t = track.value;
      const slide = t?.children[Math.max(0, Math.min(count - 1, i))] as HTMLElement | undefined;
      if (!t || !slide) return;
      const box = t.getBoundingClientRect(), r = slide.getBoundingClientRect();
      const rtl = getComputedStyle(t).direction === "rtl";
      t.scrollBy({ left: rtl ? r.right - box.right : r.left - box.left, behavior: reducedMotion(t) ? "instant" : "smooth" });
    }
    function step(by: number) {
      if ((by < 0 && edges.value.start) || (by > 0 && edges.value.end)) return;
      goTo(current.value + by);
    }
    function onKeydown(e: KeyboardEvent) {
      if (e.defaultPrevented || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      const target = e.target as HTMLElement;
      if (target !== track.value && !target.closest(".vin-carousel__controls")) return;
      e.preventDefault();
      const rtl = getComputedStyle(e.currentTarget as HTMLElement).direction === "rtl";
      step((e.key === "ArrowRight") !== rtl ? 1 : -1);
    }

    return () => {
      const slides = flatten(slots.default?.());
      if (count !== slides.length) {
        if (shown.value) schedule(); // slides came or went: measure again
        count = slides.length;
      }
      // Before the first measure (and on the server) only a single slide is known to be at the end.
      const atEnd = shown.value ? edges.value.end : slides.length <= 1;
      const vars: Record<string, string | number> = {};
      if (props.perView != null) vars["--vin-carousel-per-view"] = props.perView;
      if (props.gap != null) vars["--vin-carousel-gap"] = props.gap;
      return h("section", { "aria-roledescription": "carousel", "aria-label": props.label, class: "vin-carousel", style: vars, onKeydown }, [
        h("div", { class: "vin-carousel__track", id, ref: track, tabindex: 0, "aria-live": "polite" }, slides.map((child, i) =>
          h("div", {
            key: i,
            class: "vin-carousel__slide",
            role: "group",
            "aria-roledescription": "slide",
            "aria-label": `${i + 1} of ${slides.length}`,
            inert: shown.value ? !shown.value[i] : undefined,
          }, [child]))),
        (props.controls || props.dots) && h("div", { class: "vin-carousel__controls" }, [
          props.controls && h("button", {
            type: "button", class: "vin-btn vin-btn--outline vin-btn--icon vin-carousel__prev", "aria-controls": id, "aria-label": "Previous slide",
            "aria-disabled": edges.value.start || undefined, onClick: () => step(-1),
          }, [chevron("m15 6-6 6 6 6")]),
          props.dots && h("div", { class: "vin-carousel__dots", role: "group", "aria-label": "Choose a slide" }, slides.map((_, i) =>
            h("button", {
              key: i, type: "button", class: "vin-carousel__dot", "aria-controls": id, "aria-label": `Slide ${i + 1}`,
              "aria-current": i === current.value || undefined, onClick: () => goTo(i),
            }))),
          props.controls && h("button", {
            type: "button", class: "vin-btn vin-btn--outline vin-btn--icon vin-carousel__next", "aria-controls": id, "aria-label": "Next slide",
            "aria-disabled": atEnd || undefined, onClick: () => step(1),
          }, [chevron("m9 6 6 6-6 6")]),
        ]),
      ]);
    };
  },
});
export default Carousel;
</script>
