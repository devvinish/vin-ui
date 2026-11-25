<!-- VinUI · Card body (Svelte). Part of card.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLAttributes<HTMLDivElement>, "class"> & { class?: string; children?: Snippet } = $props();
</script>

<div {...rest} class={["vin-card__body", className].filter(Boolean).join(" ")}>{@render children?.()}</div>
