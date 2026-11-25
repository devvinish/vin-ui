<!-- VinUI · Code (Svelte). Inline code. Part of typography.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLAttributes<HTMLElement>, "class"> & { class?: string; children?: Snippet } = $props();
</script>

<code {...rest} class={["vin-code", className].filter(Boolean).join(" ")}>{@render children?.()}</code>
