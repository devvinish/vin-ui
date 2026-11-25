<!--
  VinUI · Context Menu (Svelte). API: spec/context-menu.json. Needs the dropdown-menu item parts.
  Right-click, long-press, or focus the area and press Shift+F10 / the Menu key. The items are
  Dropdown Menu's: DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup…
    <ContextMenu label="File actions">
      Right-click here
      {#snippet content()}<DropdownMenuItem>Rename</DropdownMenuItem>{/snippet}
    </ContextMenu>
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type ContextMenuProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "content"> & {
    /** The menu's items. */
    content: Snippet;
    /** Name for the menu, read by screen readers. */
    label: string;
    onOpenChange?: (open: boolean) => void;
    class?: string;
    /** The area that opens the menu. */
    children?: Snippet;
  };
</script>

<script lang="ts">
  import { setContext } from "svelte";

  let {
    content,
    label,
    onOpenChange,
    class: className,
    children,
    tabindex = 0,
    oncontextmenu,
    onkeydown,
    onpointerdown,
    onpointerup,
    onpointercancel,
    onpointermove,
    ...rest
  }: ContextMenuProps = $props();

  const uid = $props.id();
  const id = `vin-cm-${uid}`;
  let area = $state<HTMLDivElement>();
  let menu = $state<HTMLDivElement>();
  let press: ReturnType<typeof setTimeout> | undefined;

  const items = () =>
    [...(menu?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])].filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");
  const move = (to: number) => {
    const all = items();
    if (all.length) all[(to + all.length) % all.length].focus();
  };
  const close = () => {
    menu?.hidePopover?.();
    area?.focus({ preventScroll: true });
  };
  setContext("vin-menu", { close });

  function openAt(x: number, y: number) {
    const el = menu;
    if (!el?.showPopover) return;
    if (el.matches(":popover-open")) el.hidePopover();
    el.showPopover();
    const w = el.offsetWidth,
      h = el.offsetHeight,
      vw = document.documentElement.clientWidth,
      vh = window.innerHeight,
      m = 8;
    if (area && getComputedStyle(area).direction === "rtl") x -= w;
    el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
    el.style.top = `${Math.max(m, Math.min(y, vh - h - m))}px`;
    move(0);
  }

  $effect(() => {
    const el = menu;
    if (!el) return;
    const onToggle = (e: Event) => {
      const open = (e as ToggleEvent).newState === "open";
      onOpenChange?.(open);
      if (!open && el.contains(document.activeElement)) area?.focus({ preventScroll: true });
    };
    el.addEventListener("toggle", onToggle);
    return () => el.removeEventListener("toggle", onToggle);
  });

  const typed = { text: "", at: 0 };
  function onMenuKey(e: KeyboardEvent) {
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
  function onMenuMove(e: PointerEvent) {
    const item = (e.target as HTMLElement).closest<HTMLButtonElement>('[role^="menuitem"]');
    if (item && items().includes(item) && document.activeElement !== item) item.focus({ preventScroll: true });
  }

  type Ev<E extends Event> = E & { currentTarget: EventTarget & HTMLDivElement };
  function onContext(e: Ev<MouseEvent>) {
    oncontextmenu?.(e);
    if (e.defaultPrevented || (e.shiftKey && e.button === 2)) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    if (!e.clientX && !e.clientY) openAt(r.left + 8, r.top + 8);
    else openAt(e.clientX, e.clientY);
  }
  function onAreaKey(e: Ev<KeyboardEvent>) {
    onkeydown?.(e);
    // Not every browser turns Shift+F10 or the Menu key into a contextmenu event.
    if (e.defaultPrevented || e.target !== e.currentTarget || !((e.key === "F10" && e.shiftKey) || e.key === "ContextMenu")) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    openAt(r.left + 8, r.top + 8);
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions (focus the area, then Shift+F10 or the Menu key opens its menu) -->
<div
  {...rest}
  bind:this={area}
  {tabindex}
  class={["vin-context-menu", className].filter(Boolean).join(" ")}
  oncontextmenu={onContext}
  onkeydown={onAreaKey}
  onpointerdown={(e) => {
    onpointerdown?.(e);
    if (e.pointerType !== "touch") return;
    const { clientX, clientY } = e;
    press = setTimeout(() => openAt(clientX, clientY), 550);
  }}
  onpointerup={(e) => {
    onpointerup?.(e);
    clearTimeout(press);
  }}
  onpointercancel={(e) => {
    onpointercancel?.(e);
    clearTimeout(press);
  }}
  onpointermove={(e) => {
    onpointermove?.(e);
    if (e.movementX ** 2 + e.movementY ** 2 > 25) clearTimeout(press);
  }}
>
  {@render children?.()}
</div>
<!-- svelte-ignore a11y_interactive_supports_focus (focus goes to the items; the menu only handles their keys) -->
<div bind:this={menu} {id} popover="auto" role="menu" aria-label={label} class="vin-menu" onkeydown={onMenuKey} onpointermove={onMenuMove}>
  {@render content()}
</div>
