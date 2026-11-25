<!-- VinUI · Sidebar content (Svelte). The groups. It scrolls when they don't fit. Part of sidebar.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & { class?: string; children?: Snippet };
  let { class: className, children, ...rest }: Props = $props();
</script>

<div {...rest} class={["vin-sidebar__content", className].filter(Boolean).join(" ")}>{@render children?.()}</div>
