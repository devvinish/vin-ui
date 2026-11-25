<!-- VinUI · Dropdown Menu separator (Svelte). Part of dropdown-menu.svelte. -->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, ...rest }: Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> & { class?: string } = $props();
</script>

<div {...rest} role="separator" class={["vin-menu__separator", className].filter(Boolean).join(" ")}></div>
