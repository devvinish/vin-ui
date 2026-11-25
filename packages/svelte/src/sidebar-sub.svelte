<!--
  VinUI · Sidebar sub (Svelte). An item that opens a nested list of SidebarItems. Part of sidebar.svelte.
  bind:open works.
-->
<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLDetailsAttributes } from "svelte/elements";
  import type { SidebarContext } from "./sidebar-layout.svelte";

  type Props = Omit<HTMLDetailsAttributes, "class" | "open"> & {
    /** The item's text. */
    label: string | Snippet;
    icon?: Snippet;
    open?: boolean;
    class?: string;
    children?: Snippet;
  };
  let { label, icon, open = $bindable(false), class: className, children, ...rest }: Props = $props();

  const ctx = getContext<SidebarContext | undefined>("vin-sidebar");
  let name = $state<HTMLSpanElement>();
  const tip = $derived(ctx && ctx.collapsed && !ctx.phone ? name?.textContent?.trim() || undefined : undefined);
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<li>
  <details {...rest} bind:open class={["vin-sidebar__sub", className].filter(Boolean).join(" ")}>
    <summary class="vin-sidebar__item" title={tip}>
      {@render icon?.()}<span class="vin-sidebar__text" bind:this={name}>{@render text(label)}</span>
    </summary>
    <ul class="vin-sidebar__submenu">{@render children?.()}</ul>
  </details>
</li>
