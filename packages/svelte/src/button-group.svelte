<!--
  VinUI · Button Group (Svelte). API: spec/button-group.json.
  Joins Buttons into one control. Name the group with aria-label.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    orientation?: "horizontal" | "vertical";
    class?: string;
    children?: Snippet;
  };
  let { orientation = "horizontal", class: className, children, ...rest }: Props = $props();

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !rest["aria-label"] && !rest["aria-labelledby"]) console.warn("VinUI ButtonGroup: give the group an aria-label.");
  };
  warnIfUnnamed();
</script>

<div role="group" {...rest} class={["vin-btn-group", orientation === "vertical" && "vin-btn-group--vertical", className].filter(Boolean).join(" ")}>
  {@render children?.()}
</div>
