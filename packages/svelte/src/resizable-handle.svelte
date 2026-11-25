<!--
  VinUI · Resizable Handle (Svelte). Goes between two <ResizablePanel>s. Part of resizable.svelte.
  Arrows move it, Home/End go to the smallest/largest size, Enter collapses the panel before it and restores it.
-->
<script lang="ts">
  import { getContext } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { ResizableContext } from "./resizable.svelte";

  const STEP = 5;

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    /** What it resizes, for screen readers. Default "Resize". */
    label?: string;
    /** Draw a small grip in the middle of the line. */
    withGrip?: boolean;
    class?: string;
  };
  let { label = "Resize", withGrip = false, class: className, onkeydown, onpointerdown, ...rest }: Props = $props();

  const found = getContext<ResizableContext | undefined>("vin-resizable");
  if (!found) throw new Error("VinUI: <ResizableHandle> must be inside <ResizableGroup>");
  const ctx: ResizableContext = found;
  const i = ctx.addHandle();
  let saved: number | null = null;
  let dragging = $state(false);

  const sizes = $derived(ctx.sizes());
  const mins = $derived(ctx.mins());
  // Until the group has mounted, the panel after this handle may not have signed up yet.
  const ok = $derived(sizes[i + 1] !== undefined);
  const rtl = () => !ctx.vertical && !!ctx.el && getComputedStyle(ctx.el).direction === "rtl";

  function keyDown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onkeydown?.(e);
    if (e.defaultPrevented || !ok) return;
    const back = rtl() ? STEP : -STEP;
    const d = ctx.vertical ? ({ ArrowUp: -STEP, ArrowDown: STEP } as Record<string, number>)[e.key] : ({ ArrowLeft: back, ArrowRight: -back } as Record<string, number>)[e.key];
    if (d) ctx.set(i, sizes[i] + d);
    else if (e.key === "Home") ctx.set(i, mins[i]);
    else if (e.key === "End") ctx.set(i, Infinity);
    else if (e.key === "Enter") {
      // Collapse the panel before the handle to its minimum; Enter again restores it.
      if (sizes[i] > mins[i]) {
        saved = sizes[i];
        ctx.set(i, mins[i]);
      } else if (saved != null) {
        ctx.set(i, saved);
        saved = null;
      }
    } else return;
    e.preventDefault();
  }

  function pointerDown(e: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onpointerdown?.(e);
    const g = ctx.el;
    if (e.defaultPrevented || e.button !== 0 || !ok || !g) return;
    e.preventDefault();
    const h = e.currentTarget;
    h.focus();
    const vertical = ctx.vertical;
    const start = vertical ? e.clientY : e.clientX;
    const from = sizes[i];
    const dir = rtl() ? -1 : 1;
    let free = vertical ? g.clientHeight : g.clientWidth;
    for (const x of Array.from(g.children) as HTMLElement[]) if (x.classList.contains("vin-resizable__handle")) free -= vertical ? x.offsetHeight : x.offsetWidth;
    h.setPointerCapture(e.pointerId);
    dragging = true;
    g.setAttribute("data-dragging", "");
    const move = (ev: PointerEvent) => ctx.set(i, from + ((dir * ((vertical ? ev.clientY : ev.clientX) - start)) / Math.max(1, free)) * 100);
    const up = () => {
      dragging = false;
      g.removeAttribute("data-dragging");
      h.removeEventListener("pointermove", move);
      h.removeEventListener("pointerup", up);
      h.removeEventListener("pointercancel", up);
    };
    h.addEventListener("pointermove", move);
    h.addEventListener("pointerup", up);
    h.addEventListener("pointercancel", up);
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (a focusable separator is the WAI-ARIA window splitter) -->
<div
  role="separator"
  tabindex="0"
  aria-label={label}
  aria-controls={ctx.ids()[i]}
  aria-orientation={ctx.vertical ? "horizontal" : "vertical"}
  aria-valuenow={ok ? Math.round(sizes[i]) : undefined}
  aria-valuemin={ok ? mins[i] : undefined}
  aria-valuemax={ok ? Math.round(sizes[i] + sizes[i + 1] - mins[i + 1]) : undefined}
  data-dragging={dragging ? "" : undefined}
  {...rest}
  class={["vin-resizable__handle", withGrip && "vin-resizable__handle--grip", className].filter(Boolean).join(" ")}
  onkeydown={keyDown}
  onpointerdown={pointerDown}
></div>
