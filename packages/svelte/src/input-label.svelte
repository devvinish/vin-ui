<!-- VinUI · Label (Svelte). Part of input.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLLabelAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLLabelAttributes, "class"> & { class?: string; children?: Snippet } = $props();
</script>

<label {...rest} class={["vin-label", className].filter(Boolean).join(" ")}>{@render children?.()}</label>
