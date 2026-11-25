<!-- VinUI · Sidebar group (Svelte). A heading and its list of SidebarItems. Part of sidebar.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** The group's heading. It also names the list for screen readers. */
    label: string | Snippet;
    class?: string;
    children?: Snippet;
  };
  let { label, class: className, children, ...rest }: Props = $props();

  const uid = $props.id();
  const id = `vin-sbg-${uid}`;
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<div {...rest} class={["vin-sidebar__group", className].filter(Boolean).join(" ")}>
  <p class="vin-sidebar__label" {id}>{@render text(label)}</p>
  <ul class="vin-sidebar__menu" aria-labelledby={id}>{@render children?.()}</ul>
</div>
