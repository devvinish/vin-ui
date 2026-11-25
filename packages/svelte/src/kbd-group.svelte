<!-- VinUI · Kbd group (Svelte). Holds the keys of one shortcut. Part of kbd.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLAttributes<HTMLElement>, "class"> & { class?: string; children?: Snippet } = $props();
</script>

<kbd {...rest} class={["vin-kbd-group", className].filter(Boolean).join(" ")}>{@render children?.()}</kbd>
