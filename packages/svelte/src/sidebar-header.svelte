<!-- VinUI · Sidebar header (Svelte). The top of the sidebar, e.g. the app's name. Part of sidebar.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & { class?: string; children?: Snippet };
  let { class: className, children, ...rest }: Props = $props();
</script>

<div {...rest} class={["vin-sidebar__header", className].filter(Boolean).join(" ")}>{@render children?.()}</div>
