<!--
  VinUI · Dropdown Menu (Svelte). API: spec/dropdown-menu.json.
  The browser's popover with the menu keyboard: arrows, Home/End, type to jump, Escape or Tab to close.
    <DropdownMenu>
      {#snippet trigger(props)}<Button {...props}>My account</Button>{/snippet}
      <DropdownMenuItem onSelect={…}>Profile</DropdownMenuItem>
    </DropdownMenu>
  Parts: dropdown-menu-item, dropdown-menu-checkbox-item, dropdown-menu-radio-group, dropdown-menu-radio-item,
  dropdown-menu-label, dropdown-menu-separator. bind:open works.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import type { HTMLAttributes } from "svelte/elements";

  type Side = "top" | "bottom";
  type Align = "start" | "center" | "end";

  /** Spread these on the button that opens the menu. */
  export type DropdownMenuTriggerProps = {
    id: string;
    popovertarget: string;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    onkeydown: (e: KeyboardEvent) => void;
    [key: symbol]: Attachment<HTMLElement>;
  };

  export type DropdownMenuProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** The button that opens it: a snippet that spreads the props it gets. */
    trigger: Snippet<[DropdownMenuTriggerProps]>;
    side?: Side;
    align?: Align;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    class?: string;
    children?: Snippet;
  };

  /** Place `el` next to `anchor`, flipping to the other side if there's no room, and keep it on screen. */
  function place(el: HTMLElement, anchor: HTMLElement, side: Side, align: Align, gap: number) {
    const r = anchor.getBoundingClientRect(),
      w = el.offsetWidth,
      h = el.offsetHeight;
    const vw = document.documentElement.clientWidth,
      vh = window.innerHeight,
      m = 8;
    const fits = { top: r.top - gap - h >= m, bottom: r.bottom + gap + h <= vh - m };
    if (!fits[side] && fits[side === "top" ? "bottom" : "top"]) side = side === "top" ? "bottom" : "top";
    if (getComputedStyle(anchor).direction === "rtl") align = align === "start" ? "end" : align === "end" ? "start" : align;
    const y = side === "top" ? r.top - gap - h : r.bottom + gap;
    const x = align === "start" ? r.left : align === "end" ? r.right - w : r.left + (r.width - w) / 2;
    el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
    el.style.top = `${Math.max(m, Math.min(y, vh - h - m))}px`;
    el.setAttribute("data-placed", side);
  }
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import { createAttachmentKey } from "svelte/attachments";

  let {
    trigger,
    side = "bottom",
    align = "start",
    open = $bindable(false),
    onOpenChange,
    class: className,
    onkeydown,
    onpointermove,
    children,
    ...rest
  }: DropdownMenuProps = $props();

  const uid = $props.id();
  const id = `vin-menu-${uid}`;
  let menu = $state<HTMLDivElement>();
  let btn: HTMLElement | undefined;
  // The menu is named by its button: its own id if it has one.
  let triggerId = $state(`${id}-trigger`);
  let focusLast = false;

  const items = () =>
    [...(menu?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])].filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");
  const move = (to: number) => {
    const all = items();
    if (all.length) all[(to + all.length) % all.length].focus();
  };
  const close = () => {
    menu?.hidePopover?.();
    btn?.focus();
  };
  setContext("vin-menu", { close });

  // Follow the browser's open/close, keep it placed, and put focus on the first (or last) item.
  $effect(() => {
    const el = menu;
    if (!el) return;
    const s = side,
      a = align;
    const reposition = () => btn && place(el, btn, s, a, 4);
    const stop = () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
    const onToggle = (e: Event) => {
      const now = (e as ToggleEvent).newState === "open";
      if (now) {
        reposition();
        window.addEventListener("scroll", reposition, true);
        window.addEventListener("resize", reposition);
        move(focusLast ? -1 : 0);
        focusLast = false;
      } else stop();
      if (now !== open) {
        open = now;
        onOpenChange?.(now);
      }
    };
    el.addEventListener("toggle", onToggle);
    return () => {
      el.removeEventListener("toggle", onToggle);
      stop();
    };
  });

  // bind:open or open: show or hide it to match.
  $effect(() => {
    const el = menu;
    if (!el?.showPopover) return;
    const shown = el.matches(":popover-open");
    if (open && !shown) el.showPopover();
    if (!open && shown) el.hidePopover();
  });

  const typed = { text: "", at: 0 };
  function onKey(e: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onkeydown?.(e);
    const all = items(),
      at = all.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(at + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(at < 0 ? -1 : at - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      close();
    } else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // One letter jumps to the next match; a quick run of letters refines the current one.
      const now = Date.now();
      typed.text = (now - typed.at > 600 ? "" : typed.text) + e.key.toLowerCase();
      typed.at = now;
      const start = typed.text.length > 1 ? Math.max(at, 0) : at + 1;
      for (let i = 0; i < all.length; i++) {
        const item = all[(start + i) % all.length];
        if (item.textContent?.trim().toLowerCase().startsWith(typed.text)) {
          item.focus();
          break;
        }
      }
    }
  }
  function onMove(e: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onpointermove?.(e);
    const item = (e.target as HTMLElement).closest<HTMLButtonElement>('[role^="menuitem"]');
    if (item && items().includes(item) && document.activeElement !== item) item.focus({ preventScroll: true });
  }

  const ref = createAttachmentKey();
  const attach: Attachment<HTMLElement> = (node) => {
    btn = node;
    triggerId = node.id || `${id}-trigger`;
    return () => {
      if (btn === node) btn = undefined;
    };
  };
  const triggerProps = $derived<DropdownMenuTriggerProps>({
    id: `${id}-trigger`,
    popovertarget: id,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    onkeydown: (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      focusLast = e.key === "ArrowUp";
      if (!menu?.matches(":popover-open")) menu?.showPopover();
      else move(focusLast ? -1 : 0);
    },
    [ref]: attach,
  });
</script>

{@render trigger(triggerProps)}
<!-- svelte-ignore a11y_interactive_supports_focus (focus goes to the items; the menu only handles their keys) -->
<div
  {...rest}
  bind:this={menu}
  {id}
  popover="auto"
  role="menu"
  aria-labelledby={triggerId}
  data-side={side === "bottom" ? undefined : side}
  data-align={align === "start" ? undefined : align}
  class={["vin-menu", className].filter(Boolean).join(" ")}
  onkeydown={onKey}
  onpointermove={onMove}
>
  {@render children?.()}
</div>
