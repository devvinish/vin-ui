<!--
  VinUI · Skeleton (Svelte). API: spec/skeleton.json.
  Size each shape with style. Wrap them in one element with role="status" and an aria-label.
-->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & { shape?: "block" | "text" | "circle"; class?: string };
  let { shape = "block", class: className, ...rest }: Props = $props();
</script>

<div {...rest} class={["vin-skeleton", shape !== "block" && `vin-skeleton--${shape}`, className].filter(Boolean).join(" ")}></div>
