<!-- VinUI · Link (Svelte). A text link. Part of typography.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLAnchorAttributes, "class"> & { class?: string; children?: Snippet } = $props();
</script>

<a {...rest} class={["vin-link", className].filter(Boolean).join(" ")}>{@render children?.()}</a>
