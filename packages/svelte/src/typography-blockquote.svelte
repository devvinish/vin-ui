<!-- VinUI · Blockquote (Svelte). Part of typography.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLBlockquoteAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLBlockquoteAttributes, "class"> & { class?: string; children?: Snippet } = $props();
</script>

<blockquote {...rest} class={["vin-blockquote", className].filter(Boolean).join(" ")}>{@render children?.()}</blockquote>
