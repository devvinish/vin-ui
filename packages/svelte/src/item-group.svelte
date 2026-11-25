<!--
  VinUI · Item group (Svelte). A bordered list of items. Each Item inside becomes a list item for screen readers.
  Part of item.svelte.
-->
<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLAttributes<HTMLDivElement>, "class"> & { class?: string; children?: Snippet } = $props();

  setContext("vin-item-group", true);
</script>

<div role="list" {...rest} class={["vin-item-group", className].filter(Boolean).join(" ")}>{@render children?.()}</div>
