<script lang="ts">
/*
 * VinUI · Resizable (Vue). API: spec/resizable.json.
 * <ResizableGroup> holds <ResizablePanel>s with a <ResizableHandle> between each pair.
 * Handles follow the WAI-ARIA window splitter pattern: arrows move them, Home/End go to the
 * smallest/largest size, Enter collapses the panel before the handle and restores it.
 *   import ResizableGroup, { ResizablePanel, ResizableHandle } from "@/components/vin/resizable.vue";
 *   <ResizableGroup @layout="save">
 *     <ResizablePanel :default-size="30">…</ResizablePanel>
 *     <ResizableHandle label="Resize sidebar" with-grip />
 *     <ResizablePanel>…</ResizablePanel>
 *   </ResizableGroup>
 */
import {
  Comment, Fragment, computed, defineComponent, h, inject, provide, ref, shallowRef, useId,
  type ComputedRef, type InjectionKey, type PropType, type ShallowRef, type VNode,
} from "vue";

const STEP = 5;

type GroupCtx = {
  vertical: ComputedRef<boolean>;
  sizes: ComputedRef<number[]>;
  mins: ShallowRef<number[]>;
  ids: ShallowRef<string[]>;
  set: (i: number, v: number) => void;
  el: ShallowRef<HTMLDivElement | null>;
};
const GroupKey: InjectionKey<GroupCtx> = Symbol("VinResizable");
const IndexKey: InjectionKey<number> = Symbol("VinResizableIndex");

/** Gives the panel or handle inside it its position in the group. Renders nothing of its own. */
const Indexed = defineComponent({
  props: { i: { type: Number, required: true } },
  setup(props, { slots }) {
    provide(IndexKey, props.i);
    return () => slots.default?.();
  },
});

/** One pane of the group. */
export const ResizablePanel = defineComponent({
  name: "ResizablePanel",
  props: {
    /** Starting size, in percent of the group. Panels without one share what is left. */
    defaultSize: { type: Number, default: undefined },
    /** The smallest it can get, in percent. Default 10. */
    minSize: { type: Number, default: 10 },
  },
  setup(_, { slots }) {
    const ctx = inject(GroupKey, null);
    const i = inject(IndexKey, 0);
    if (!ctx) throw new Error("VinUI: <ResizablePanel> must be inside <ResizableGroup>");
    return () => h("div", { id: ctx.ids.value[i], class: "vin-resizable__panel", style: { "--vin-size": String(ctx.sizes.value[i]) } }, slots.default?.());
  },
});

/** The bar between two panels: drag it, or focus it and use the keys. */
export const ResizableHandle = defineComponent({
  name: "ResizableHandle",
  props: {
    /** What it resizes, for screen readers. Default "Resize". */
    label: { type: String, default: "Resize" },
    /** Draw a small grip in the middle of the line. */
    withGrip: { type: Boolean, default: false },
  },
  emits: { keydown: (_e: KeyboardEvent) => true, pointerdown: (_e: PointerEvent) => true },
  setup(props, { emit }) {
    const ctx = inject(GroupKey, null);
    const i = inject(IndexKey, 0);
    if (!ctx) throw new Error("VinUI: <ResizableHandle> must be inside <ResizableGroup>");
    let saved: number | null = null;
    const dragging = ref(false);
    const ok = () => ctx.sizes.value[i + 1] !== undefined;
    const rtl = () => !ctx.vertical.value && !!ctx.el.value && getComputedStyle(ctx.el.value).direction === "rtl";

    function onKeydown(e: KeyboardEvent) {
      emit("keydown", e);
      if (e.defaultPrevented || !ok()) return;
      const sizes = ctx!.sizes.value, mins = ctx!.mins.value;
      const back = rtl() ? STEP : -STEP;
      const d = ctx!.vertical.value
        ? ({ ArrowUp: -STEP, ArrowDown: STEP } as Record<string, number>)[e.key]
        : ({ ArrowLeft: back, ArrowRight: -back } as Record<string, number>)[e.key];
      if (d) ctx!.set(i, sizes[i] + d);
      else if (e.key === "Home") ctx!.set(i, mins[i]);
      else if (e.key === "End") ctx!.set(i, Infinity);
      else if (e.key === "Enter") {
        // Collapse the panel before the handle to its minimum; Enter again restores it.
        if (sizes[i] > mins[i]) { saved = sizes[i]; ctx!.set(i, mins[i]); }
        else if (saved != null) { ctx!.set(i, saved); saved = null; }
      } else return;
      e.preventDefault();
    }

    function onPointerdown(e: PointerEvent) {
      emit("pointerdown", e);
      const g = ctx!.el.value;
      if (e.defaultPrevented || e.button !== 0 || !ok() || !g) return;
      e.preventDefault();
      const hd = e.currentTarget as HTMLDivElement;
      const vertical = ctx!.vertical.value;
      hd.focus();
      const start = vertical ? e.clientY : e.clientX;
      const from = ctx!.sizes.value[i];
      const dir = rtl() ? -1 : 1;
      let free = vertical ? g.clientHeight : g.clientWidth;
      for (const x of Array.from(g.children)) {
        if (x.classList.contains("vin-resizable__handle")) free -= vertical ? (x as HTMLElement).offsetHeight : (x as HTMLElement).offsetWidth;
      }
      hd.setPointerCapture?.(e.pointerId);
      dragging.value = true;
      g.setAttribute("data-dragging", "");
      const move = (ev: PointerEvent) => ctx!.set(i, from + ((dir * ((vertical ? ev.clientY : ev.clientX) - start)) / Math.max(1, free)) * 100);
      const up = () => {
        dragging.value = false;
        g.removeAttribute("data-dragging");
        hd.removeEventListener("pointermove", move);
        hd.removeEventListener("pointerup", up);
        hd.removeEventListener("pointercancel", up);
      };
      hd.addEventListener("pointermove", move);
      hd.addEventListener("pointerup", up);
      hd.addEventListener("pointercancel", up);
    }

    return () => {
      const sizes = ctx.sizes.value, mins = ctx.mins.value, has = ok();
      return h("div", {
        role: "separator",
        tabindex: 0,
        "aria-label": props.label,
        "aria-controls": ctx.ids.value[i],
        "aria-orientation": ctx.vertical.value ? "horizontal" : "vertical",
        "aria-valuenow": has ? Math.round(sizes[i]) : undefined,
        "aria-valuemin": has ? mins[i] : undefined,
        "aria-valuemax": has ? Math.round(sizes[i] + sizes[i + 1] - mins[i + 1]) : undefined,
        "data-dragging": dragging.value ? "" : undefined,
        class: ["vin-resizable__handle", props.withGrip && "vin-resizable__handle--grip"],
        onKeydown,
        onPointerdown,
      });
    };
  },
});

/** Slot children with fragments (v-for, templates) opened up and comments dropped. */
function flatten(nodes: VNode[] | undefined): VNode[] {
  return (nodes ?? []).flatMap((n) => (n.type === Fragment ? flatten(n.children as VNode[]) : n.type === Comment ? [] : [n]));
}
/** A prop from a slot VNode, written either camelCase or kebab-case. */
const propOf = (n: VNode, camel: string, kebab: string) => {
  const p = (n.props ?? {}) as Record<string, unknown>;
  const v = p[camel] ?? p[kebab];
  return v === undefined || v === null ? undefined : Number(v);
};

/** Set a list only when it really changed, so children don't re-render for nothing. */
function keep<T>(r: ShallowRef<T[]>, next: T[]) {
  if (r.value.length !== next.length || r.value.some((v, i) => v !== next[i])) r.value = next;
}

/** Holds the panels and handles, and keeps their sizes (in percent). */
const ResizableGroup = defineComponent({
  name: "ResizableGroup",
  props: {
    /** Panels side by side (horizontal) or stacked (vertical). */
    orientation: { type: String as PropType<"horizontal" | "vertical">, default: "horizontal" },
  },
  emits: { /** Every panel's size, in percent, after a change. */ layout: (_sizes: number[]) => true },
  setup(props, { emit, slots }) {
    const base = "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const el = shallowRef<HTMLDivElement | null>(null);
    // Worked out from the panels' props on each render, until someone resizes.
    const initial = shallowRef<number[]>([]);
    const changed = shallowRef<number[] | null>(null);
    const mins = shallowRef<number[]>([]);
    const ids = shallowRef<string[]>([]);
    const sizes = computed(() => changed.value ?? initial.value);
    const vertical = computed(() => props.orientation === "vertical");

    function set(i: number, v: number) {
      const now = sizes.value, m = mins.value;
      const pair = now[i] + now[i + 1];
      const next = Math.min(pair - m[i + 1], Math.max(m[i], Math.round(v)));
      if (next === now[i]) return;
      const out = now.slice();
      out[i] = next;
      out[i + 1] = pair - next;
      changed.value = out;
      emit("layout", out);
    }
    provide(GroupKey, { vertical, sizes, mins, ids, set, el });

    return () => {
      const items = flatten(slots.default?.());
      const panels = items.filter((n) => n.type === ResizablePanel);
      const given = panels.map((p) => propOf(p, "defaultSize", "default-size"));
      const known = given.reduce<number>((a, s) => a + (s ?? 0), 0);
      const missing = given.filter((s) => s === undefined).length;
      // These only change when the panels do; the panels and handles read them when they render.
      keep(initial, given.map((s) => s ?? Math.max(0, 100 - known) / missing));
      keep(mins, panels.map((p) => propOf(p, "minSize", "min-size") ?? 10));
      keep(ids, panels.map((p, i) => ((p.props as { id?: string } | null)?.id) ?? `${base}-panel-${i}`));
      if (changed.value && changed.value.length !== panels.length) changed.value = null;
      let pi = 0, hi = 0;
      const kids = items.map((n, k) =>
        n.type === ResizablePanel ? h(Indexed, { i: pi++, key: n.key ?? `p${k}` }, () => n)
          : n.type === ResizableHandle ? h(Indexed, { i: hi++, key: n.key ?? `h${k}` }, () => n)
            : n);
      return h("div", { ref: el, class: ["vin-resizable", vertical.value && "vin-resizable--vertical"] }, kids);
    };
  },
});
export default ResizableGroup;
</script>
