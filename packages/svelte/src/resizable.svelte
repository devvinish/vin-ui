<!--
  VinUI · Resizable (Svelte). API: spec/resizable.json. This file is <ResizableGroup>.
  It holds <ResizablePanel>s (resizable-panel.svelte) with a <ResizableHandle> (resizable-handle.svelte)
  between each pair. Handles follow the WAI-ARIA window splitter pattern: arrows move them, Home/End go
  to the smallest/largest size, Enter collapses the panel before the handle and restores it.
  Panels sign up as they render, so server HTML has each handle's aria-value* (and the size of a
  panel without defaultSize that comes before others) only once the page hydrates.
-->
<script lang="ts" module>
  /** What panels and handles read from their group. */
  export type ResizableContext = {
    readonly vertical: boolean;
    readonly el: HTMLDivElement | undefined;
    sizes: () => number[];
    mins: () => number[];
    ids: () => string[];
    set: (i: number, v: number) => void;
    addPanel: (p: { size?: number; min: number; id?: string }) => number;
    addHandle: () => number;
  };
</script>

<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** Panels side by side (horizontal) or stacked (vertical). */
    orientation?: "horizontal" | "vertical";
    /** Called with every panel's size, in percent, after a change. */
    onLayout?: (sizes: number[]) => void;
    class?: string;
    children?: Snippet;
  };
  let { orientation = "horizontal", onLayout, class: className, children, ...rest }: Props = $props();

  const uid = $props.id();
  // Panels and handles sign up in the order they render, which is their order in the group.
  const panels: { size?: number; min: number; id: string }[] = [];
  let handles = 0;
  let el = $state<HTMLDivElement>();
  // Set once mounted (when every panel has signed up), then on every change.
  let sizes = $state<number[] | null>(null);

  const initial = () => {
    const known = panels.reduce((a, p) => a + (p.size ?? 0), 0);
    const missing = panels.filter((p) => p.size === undefined).length;
    return panels.map((p) => p.size ?? Math.max(0, 100 - known) / missing);
  };
  const now = () => sizes ?? initial();

  $effect(() => {
    sizes = initial();
  });

  function set(i: number, v: number) {
    const cur = now(),
      mins = panels.map((p) => p.min);
    const pair = cur[i] + cur[i + 1];
    const next = Math.min(pair - mins[i + 1], Math.max(mins[i], Math.round(v)));
    if (next === cur[i]) return;
    const out = cur.slice();
    out[i] = next;
    out[i + 1] = pair - next;
    sizes = out;
    onLayout?.(out);
  }

  setContext<ResizableContext>("vin-resizable", {
    get vertical() {
      return orientation === "vertical";
    },
    get el() {
      return el;
    },
    sizes: now,
    mins: () => panels.map((p) => p.min),
    ids: () => panels.map((p) => p.id),
    set,
    addPanel: (p) => {
      panels.push({ ...p, id: p.id ?? `vin-${uid}-panel-${panels.length}` });
      return panels.length - 1;
    },
    addHandle: () => handles++,
  });
</script>

<div bind:this={el} {...rest} class={["vin-resizable", orientation === "vertical" && "vin-resizable--vertical", className].filter(Boolean).join(" ")}>
  {@render children?.()}
</div>
