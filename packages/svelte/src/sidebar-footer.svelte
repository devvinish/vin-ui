<!-- VinUI · Sidebar footer (Svelte). The bottom of the sidebar, e.g. help or the account. Part of sidebar.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & { class?: string; children?: Snippet };
  let { class: className, children, ...rest }: Props = $props();
</script>

<div {...rest} class={["vin-sidebar__footer", className].filter(Boolean).join(" ")}>{@render children?.()}</div>
