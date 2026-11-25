<!-- VinUI · Menubar menu (Svelte). A trigger in the bar and its menu of Dropdown Menu items. Part of menubar.svelte. -->
<script lang="ts">
  import { getContext, setContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { MenubarContext } from "./menubar.svelte";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class" | "role"> & {
    /** The trigger's text. */
    label: string | Snippet;
    disabled?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    class?: string;
    /** The items: DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup and the rest. */
    children?: Snippet;
  };
  let {
    label,
    disabled = false,
    open = $bindable(false),
    onOpenChange,
    class: className,
    onkeydown,
    onpointermove,
    children,
    ...rest
  }: Props = $props();

  const found = getContext<MenubarContext | undefined>("vin-menubar");
  if (!found) throw new Error("VinUI MenubarMenu must be inside <Menubar>.");
  const bar: MenubarContext = found;
  const index = bar.register();

  const uid = $props.id();
  const id = `vin-mb-${uid}`;
  let btn = $state<HTMLButtonElement>();
  let menu = $state<HTMLDivElement>();

  const items = () =>
    [...(menu?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])].filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");
  const move = (to: number) => {
    const all = items();
    if (all.length) all[(to + all.length) % all.length].focus();
  };
  const isOpen = () => !!menu?.matches(":popover-open");
  const close = () => {
    menu?.hidePopover?.();
    btn?.focus();
  };
  setContext("vin-menu", { close });

  /** Focus the first item, or the last when the menu was opened with Up Arrow. */
  function focusItem() {
    move(menu?.hasAttribute("data-vin-last") ? -1 : 0);
    menu?.removeAttribute("data-vin-last");
  }

  /** Place the menu under its trigger, flipping up if there's no room, and keep it on screen. */
  function place() {
    if (!menu || !btn) return;
    const r = btn.getBoundingClientRect(),
      w = menu.offsetWidth,
      h = menu.offsetHeight,
      gap = 6,
      m = 8;
    const vw = document.documentElement.clientWidth,
      vh = window.innerHeight;
    const up = r.bottom + gap + h > vh - m && r.top - gap - h >= m;
    const rtl = getComputedStyle(btn).direction === "rtl";
    menu.style.left = `${Math.max(m, Math.min(rtl ? r.right - w : r.left, vw - w - m))}px`;
    menu.style.top = `${Math.max(m, Math.min(up ? r.top - gap - h : r.bottom + gap, vh - h - m))}px`;
    menu.setAttribute("data-placed", up ? "top" : "bottom");
  }

  $effect(() => {
    const el = menu;
    if (!el) return;
    const stop = () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
    // Closing with focus inside hands it back to the trigger.
    const giveBack = () => {
      if (el.contains(document.activeElement)) btn?.focus();
    };
    const onBefore = (e: Event) => {
      if ((e as ToggleEvent).newState === "closed") giveBack();
    };
    const onToggle = (e: Event) => {
      const now = (e as ToggleEvent).newState === "open";
      if (now) {
        bar.setActive(index);
        place();
        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);
        focusItem();
      } else {
        giveBack();
        stop();
      }
      if (now !== open) {
        open = now;
        onOpenChange?.(now);
      }
    };
    el.addEventListener("beforetoggle", onBefore);
    el.addEventListener("toggle", onToggle);
    el.addEventListener("vin-focus-item", focusItem);
    return () => {
      el.removeEventListener("beforetoggle", onBefore);
      el.removeEventListener("toggle", onToggle);
      el.removeEventListener("vin-focus-item", focusItem);
      stop();
    };
  });

  // bind:open or open: show or hide it to match.
  $effect(() => {
    const el = menu;
    if (!el?.showPopover) return;
    const shown = el.matches(":popover-open");
    if (open && !shown && btn) bar.openFrom(btn, 0);
    if (!open && shown) el.hidePopover();
  });

  function onTriggerKey(e: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    const t = e.currentTarget;
    const where = { ArrowRight: "next", ArrowLeft: "prev", Home: "first", End: "last" } as const;
    if (e.key in where) {
      e.preventDefault();
      bar.focusFrom(t, where[e.key as keyof typeof where]);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      bar.openFrom(t, 0, e.key === "ArrowUp");
    }
  }

  function onEnter(e: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    // While a menu is open, pointing at another trigger switches to it.
    if (e.pointerType !== "touch" && !isOpen() && bar.anyOpen()) bar.openFrom(e.currentTarget, 0);
  }

  const typed = { text: "", at: 0 };
  function onMenuKey(e: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
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
    } else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && btn) {
      // Left and Right move to the next menu in the bar, and open it.
      e.preventDefault();
      bar.openFrom(btn, e.key === "ArrowRight" ? 1 : -1);
    } else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
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
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<button
  type="button"
  bind:this={btn}
  id="{id}-trigger"
  class="vin-menubar__trigger"
  role="menuitem"
  aria-haspopup="menu"
  aria-expanded={open}
  popovertarget={id}
  tabindex={bar.active === index ? 0 : -1}
  {disabled}
  onkeydown={onTriggerKey}
  onfocus={() => bar.setActive(index)}
  onpointerenter={onEnter}
>{@render text(label)}</button>
<!-- svelte-ignore a11y_interactive_supports_focus (focus goes to the items; the menu only handles their keys) -->
<div
  {...rest}
  bind:this={menu}
  {id}
  popover="auto"
  role="menu"
  aria-labelledby="{id}-trigger"
  class={["vin-menu", className].filter(Boolean).join(" ")}
  onkeydown={onMenuKey}
  onpointermove={onMove}
>
  {@render children?.()}
</div>
