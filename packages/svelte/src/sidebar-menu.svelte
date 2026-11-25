<!-- VinUI · Sidebar menu (Svelte). A list of items outside a group, e.g. in the header or footer. Part of sidebar.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLUListElement>, "class"> & { class?: string; children?: Snippet };
  let { class: className, children, ...rest }: Props = $props();
</script>

<ul {...rest} class={["vin-sidebar__menu", className].filter(Boolean).join(" ")}>{@render children?.()}</ul>
