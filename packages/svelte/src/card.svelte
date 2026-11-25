<!--
  VinUI · Card (Svelte)
  API: spec/card.json. Every part is optional; styling comes from @vinui/styles.
  Parts: card-header, card-title, card-description, card-body, card-footer.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLAttributes<HTMLDivElement>, "class"> & { class?: string; children?: Snippet } = $props();
</script>

<div {...rest} class={["vin-card", className].filter(Boolean).join(" ")}>{@render children?.()}</div>
