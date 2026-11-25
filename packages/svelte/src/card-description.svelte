<!-- VinUI · Card description (Svelte). Part of card.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLAttributes<HTMLParagraphElement>, "class"> & { class?: string; children?: Snippet } = $props();
</script>

<p {...rest} class={["vin-card__desc", className].filter(Boolean).join(" ")}>{@render children?.()}</p>
