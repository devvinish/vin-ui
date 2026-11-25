<!--
  VinUI · Sidebar item (Svelte). A link in the sidebar. Part of sidebar.svelte.
  Folded, it shows only its icon, with its text as a tooltip.
-->
<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import type { SidebarContext } from "./sidebar-layout.svelte";

  type Props = Omit<HTMLAnchorAttributes, "class"> & {
    /** Shown on its own when the sidebar is folded. */
    icon?: Snippet;
    /** Marks the link to the current page. */
    active?: boolean;
    /** A count or short label at the end, e.g. unread messages. */
    badge?: string | number | Snippet;
    class?: string;
    children?: Snippet;
  };
  let { icon, active = false, badge, class: className, children, ...rest }: Props = $props();

  const ctx = getContext<SidebarContext | undefined>("vin-sidebar");
  let label = $state<HTMLSpanElement>();
  const tip = $derived(ctx && ctx.collapsed && !ctx.phone ? label?.textContent?.trim() || undefined : undefined);
</script>

{#snippet text(v: string | number | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<li>
  <a title={tip} aria-current={active ? "page" : undefined} {...rest} class={["vin-sidebar__item", className].filter(Boolean).join(" ")}>
    {@render icon?.()}<span class="vin-sidebar__text" bind:this={label}>{@render children?.()}</span>
    {#if badge != null}<span class="vin-sidebar__badge">{@render text(badge)}</span>{/if}
  </a>
</li>
