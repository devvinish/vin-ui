<!-- VinUI · Bubble Group (Svelte). A column of bubbles; bubbles from the same speaker sit close together. Part of bubble.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLAttributes<HTMLDivElement>, "class"> & { class?: string; children?: Snippet } = $props();
</script>

<div {...rest} class={["vin-bubble-group", className].filter(Boolean).join(" ")}>{@render children?.()}</div>
