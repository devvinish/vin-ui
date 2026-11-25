<!-- VinUI · Dropdown Menu label (Svelte). A heading for a group of items. Part of dropdown-menu.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLAttributes<HTMLParagraphElement>, "class"> & { class?: string; children?: Snippet } = $props();
</script>

<p {...rest} role="presentation" class={["vin-menu__label", className].filter(Boolean).join(" ")}>{@render children?.()}</p>
