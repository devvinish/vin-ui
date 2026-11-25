<!--
  VinUI · Sidebar layout (Svelte). Holds the sidebar and the page beside it. Part of sidebar.svelte.
  768px and wider, collapsed folds the sidebar to icons (data-state="collapsed"); narrower, it's a popover.
  bind:collapsed works.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Screens narrower than this get the off-canvas sidebar. */
  export const SIDEBAR_PHONE = "(max-width: 767px)";

  export type SidebarContext = {
    readonly id: string;
    readonly collapsed: boolean;
    readonly phone: boolean;
    readonly open: boolean;
    setCollapsed: (on: boolean) => void;
    setOpen: (on: boolean) => void;
    nav: HTMLElement | undefined;
    opener: HTMLElement | undefined;
  };

  export type SidebarLayoutProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** Folded to icons (wide screens). */
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    class?: string;
    children?: Snippet;
  };
</script>

<script lang="ts">
  import { setContext } from "svelte";

  let { collapsed = $bindable(false), onCollapsedChange, class: className, children, ...rest }: SidebarLayoutProps = $props();

  const uid = $props.id();
  let phone = $state(false);
  let open = $state(false);

  const ctx: SidebarContext = {
    id: `vin-sb-${uid}`,
    get collapsed() {
      return collapsed;
    },
    get phone() {
      return phone;
    },
    get open() {
      return open;
    },
    setCollapsed(on) {
      collapsed = on;
      onCollapsedChange?.(on);
    },
    setOpen: (on) => (open = on),
    nav: undefined,
    opener: undefined,
  };
  setContext("vin-sidebar", ctx);

  // Follow the screen width; growing past a phone closes the off-canvas sidebar.
  $effect(() => {
    const mq = window.matchMedia?.(SIDEBAR_PHONE);
    if (!mq) return;
    const onChange = () => {
      phone = mq.matches;
      if (!mq.matches && ctx.nav?.matches(":popover-open")) ctx.nav.hidePopover();
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  });
</script>

<div {...rest} data-state={collapsed ? "collapsed" : undefined} class={["vin-sidebar-layout", className].filter(Boolean).join(" ")}>
  {@render children?.()}
</div>
