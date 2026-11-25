<!--
  VinUI · Kbd (Svelte). API: spec/kbd.json.
  <Kbd>K</Kbd> is one key; <KbdGroup> (kbd-group.svelte) holds the keys of a shortcut.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: Omit<HTMLAttributes<HTMLElement>, "class"> & { class?: string; children?: Snippet } = $props();
</script>

<kbd {...rest} class={["vin-kbd", className].filter(Boolean).join(" ")}>{@render children?.()}</kbd>
