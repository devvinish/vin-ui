<!--
  VinUI · Sidebar (Svelte). API: spec/sidebar.json. Needs button.svelte next to it.
  768px and wider it sits beside the page and folds to icons; narrower, the trigger slides it in.
    <SidebarLayout>
      <Sidebar label="App">
        <SidebarContent>
          <SidebarGroup label="Platform"><SidebarItem href="/" active>Dashboard</SidebarItem></SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset><SidebarTrigger />…</SidebarInset>
    </SidebarLayout>
  This file is <Sidebar>, the navigation itself. Parts: sidebar-layout, sidebar-header, sidebar-content,
  sidebar-footer, sidebar-group, sidebar-menu, sidebar-item, sidebar-sub, sidebar-trigger, sidebar-inset.
-->
<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { SidebarContext } from "./sidebar-layout.svelte";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Name for the navigation, read by screen readers. */
    label: string;
    class?: string;
    children?: Snippet;
  };
  let { label, class: className, onclick, children, ...rest }: Props = $props();

  const found = getContext<SidebarContext | undefined>("vin-sidebar");
  if (!found) throw new Error("VinUI Sidebar parts must be inside <SidebarLayout>.");
  const ctx: SidebarContext = found;

  let nav = $state<HTMLElement>();

  $effect(() => {
    const el = nav;
    if (!el) return;
    ctx.nav = el;
    // Closing with focus inside hands it back to the trigger that opened it.
    const giveBack = () => {
      if (el.contains(document.activeElement)) ctx.opener?.focus();
    };
    const onBefore = (e: Event) => {
      if ((e as ToggleEvent).newState === "closed") giveBack();
    };
    const onToggle = (e: Event) => {
      const now = (e as ToggleEvent).newState === "open";
      ctx.setOpen(now);
      if (now) (el.querySelector<HTMLElement>('[aria-current="page"]') ?? el.querySelector<HTMLElement>("a[href], summary, button:not(:disabled)"))?.focus();
      else giveBack();
    };
    el.addEventListener("beforetoggle", onBefore);
    el.addEventListener("toggle", onToggle);
    return () => {
      el.removeEventListener("beforetoggle", onBefore);
      el.removeEventListener("toggle", onToggle);
      if (ctx.nav === el) ctx.nav = undefined;
    };
  });

  function click(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
    onclick?.(e);
    const target = (e.target as HTMLElement).closest("a[href], summary");
    if (!target) return;
    // On a phone, following a link closes the sidebar.
    if (ctx.phone && target.tagName === "A" && nav?.matches(":popover-open")) nav.hidePopover();
    // Folded, a nested list's button unfolds the sidebar to show it.
    if (!ctx.phone && ctx.collapsed && target.tagName === "SUMMARY") {
      e.preventDefault();
      (target.parentElement as HTMLDetailsElement).open = true;
      ctx.setCollapsed(false);
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_click_events_have_key_events (the clicks come from the links inside) -->
<nav {...rest} bind:this={nav} id={ctx.id} aria-label={label} popover="auto" class={["vin-sidebar", className].filter(Boolean).join(" ")} onclick={click}>
  {@render children?.()}
</nav>
