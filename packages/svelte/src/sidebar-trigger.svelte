<!-- VinUI · Sidebar trigger (Svelte). Folds the sidebar to icons, or opens it on phones. Part of sidebar.svelte. -->
<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import Button from "./button.svelte";
  import { SIDEBAR_PHONE, type SidebarContext } from "./sidebar-layout.svelte";

  type Props = Omit<HTMLButtonAttributes, "class" | "children"> & { class?: string; children?: Snippet };
  let { class: className, onclick, children, ...rest }: Props = $props();

  const found = getContext<SidebarContext | undefined>("vin-sidebar");
  if (!found) throw new Error("VinUI Sidebar parts must be inside <SidebarLayout>.");
  const ctx: SidebarContext = found;

  const expanded = $derived(ctx.phone ? ctx.open : !ctx.collapsed);

  function click(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(e);
    if (e.defaultPrevented) return;
    if (!window.matchMedia?.(SIDEBAR_PHONE).matches) {
      ctx.setCollapsed(!ctx.collapsed);
      return;
    }
    ctx.opener = e.currentTarget;
    const nav = ctx.nav;
    if (nav?.matches(":popover-open")) nav.hidePopover();
    else nav?.showPopover?.();
  }
</script>

<Button
  variant="ghost"
  size="icon"
  aria-label="Toggle sidebar"
  {...rest}
  class={["vin-sidebar__trigger", className].filter(Boolean).join(" ")}
  aria-controls={ctx.id}
  aria-expanded={expanded}
  onclick={click}
>
  {#if children}{@render children()}{:else}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></svg>{/if}
</Button>
