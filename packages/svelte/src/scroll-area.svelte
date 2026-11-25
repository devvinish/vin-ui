<!--
  VinUI · Scroll Area (Svelte). API: spec/scroll-area.json.
  Native scrolling with thin, themed scrollbars. The box is in the Tab order (tabindex 0),
  so keyboard users can scroll it; with a label it is a named region for screen readers.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** Which way the content scrolls. */
    orientation?: "vertical" | "horizontal" | "both";
    /** A name for the region, read by screen readers. */
    label?: string;
    class?: string;
    children?: Snippet;
  };
  let { orientation = "vertical", label, class: className, children, ...rest }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (a scrolling box must be reachable by keyboard) -->
<div
  role={label ? "region" : undefined}
  aria-label={label}
  tabindex="0"
  {...rest}
  class={[
    "vin-scroll-area",
    orientation === "horizontal" && "vin-scroll-area--horizontal",
    orientation === "both" && "vin-scroll-area--both",
    className,
  ]
    .filter(Boolean)
    .join(" ")}
>
  {@render children?.()}
</div>
