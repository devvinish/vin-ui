<!--
  VinUI · Navigation Menu item (Svelte). A button and the panel it opens. Part of navigation-menu.svelte.
  Pointing at the button opens the panel after 120ms; leaving both closes it 200ms later.
  A click or Down Arrow opens it and keeps it open. Escape closes it and puts focus back on the button.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** The button's text. */
    trigger: string | Snippet;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    class?: string;
    /** The panel: usually a NavigationMenuGrid. */
    children?: Snippet;
  };
  let {
    trigger,
    open = $bindable(false),
    onOpenChange,
    class: className,
    onkeydown,
    onpointerenter,
    onpointerleave,
    children,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const id = `vin-nm-${uid}`;
  let btn = $state<HTMLButtonElement>();
  let panel = $state<HTMLDivElement>();
  let pinned = false;
  let focusFirst = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const isOpen = () => !!panel?.matches(":popover-open");
  const links = () => [...(panel?.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)") ?? [])];
  const later = (fn: () => void, ms: number) => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
  const show = (pin: boolean) => {
    clearTimeout(timer);
    pinned = pin;
    if (!isOpen()) panel?.showPopover?.();
  };
  const hide = () => {
    clearTimeout(timer);
    if (isOpen()) panel?.hidePopover();
  };

  /** Place the panel under its button, flipping up if there's no room, and keep it on screen. */
  function place() {
    if (!panel || !btn) return;
    const r = btn.getBoundingClientRect(),
      w = panel.offsetWidth,
      h = panel.offsetHeight,
      gap = 6,
      m = 8;
    const vw = document.documentElement.clientWidth,
      vh = window.innerHeight;
    const up = r.bottom + gap + h > vh - m && r.top - gap - h >= m;
    const rtl = getComputedStyle(btn).direction === "rtl";
    panel.style.left = `${Math.max(m, Math.min(rtl ? r.right - w : r.left, vw - w - m))}px`;
    panel.style.top = `${Math.max(m, Math.min(up ? r.top - gap - h : r.bottom + gap, vh - h - m))}px`;
    panel.setAttribute("data-placed", up ? "top" : "bottom");
  }

  $effect(() => {
    const el = panel;
    if (!el) return;
    const stop = () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
    // Closing with focus inside (Escape, say) hands it back to the button.
    const giveBack = () => {
      if (el.contains(document.activeElement)) btn?.focus();
    };
    const onBefore = (e: Event) => {
      if ((e as ToggleEvent).newState === "closed") giveBack();
    };
    const onToggle = (e: Event) => {
      const now = (e as ToggleEvent).newState === "open";
      if (now) {
        place();
        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);
        if (focusFirst) links()[0]?.focus();
      } else {
        pinned = false;
        giveBack();
        stop();
      }
      focusFirst = false;
      if (now !== open) {
        open = now;
        onOpenChange?.(now);
      }
    };
    el.addEventListener("beforetoggle", onBefore);
    el.addEventListener("toggle", onToggle);
    return () => {
      el.removeEventListener("beforetoggle", onBefore);
      el.removeEventListener("toggle", onToggle);
      stop();
      clearTimeout(timer);
    };
  });

  // bind:open or open: show or hide it to match.
  $effect(() => {
    const el = panel;
    if (!el?.showPopover) return;
    const shown = el.matches(":popover-open");
    if (open && !shown) show(true);
    if (!open && shown) hide();
  });

  function onPanelKey(e: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onkeydown?.(e);
    const l = links(),
      i = l.indexOf(document.activeElement as HTMLElement);
    const to =
      e.key === "ArrowDown"
        ? l[(i + 1) % l.length]
        : e.key === "ArrowUp"
          ? l[(i - 1 + l.length) % l.length]
          : e.key === "Home"
            ? l[0]
            : e.key === "End"
              ? l[l.length - 1]
              : null;
    if (to) {
      e.preventDefault();
      to.focus();
    } else if (e.key === "Escape" && isOpen()) {
      // The browser closes an open popover on Escape too; doing it here also covers older engines.
      e.preventDefault();
      hide();
      btn?.focus();
    }
  }

  function onButtonKey(e: KeyboardEvent) {
    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      hide();
      return;
    }
    if (e.key !== "ArrowDown") return;
    e.preventDefault();
    if (isOpen()) {
      pinned = true;
      links()[0]?.focus();
    } else {
      focusFirst = true;
      show(true);
    }
  }

  function onButtonClick(e: MouseEvent) {
    // The click is ours: a panel opened by hover stays open when clicked, a second click closes it.
    e.preventDefault();
    if (isOpen() && !pinned) {
      pinned = true;
      clearTimeout(timer);
    } else if (isOpen()) hide();
    else show(true);
  }

  function onFocusOut(e: FocusEvent & { currentTarget: EventTarget & HTMLLIElement }) {
    // Focus leaving the button and its panel closes it.
    const item = e.currentTarget,
      to = e.relatedTarget as Node | null;
    if (to) {
      if (!item.contains(to)) hide();
    } else
      setTimeout(() => {
        if (!item.contains(document.activeElement)) hide();
      }, 0);
  }
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<li class="vin-nav-menu__item" onfocusout={onFocusOut}>
  <button
    type="button"
    bind:this={btn}
    class="vin-nav-menu__trigger"
    aria-expanded={open}
    aria-controls={id}
    popovertarget={id}
    onclick={onButtonClick}
    onkeydown={onButtonKey}
    onpointerenter={(e) => {
      if (e.pointerType === "touch") return;
      if (isOpen()) clearTimeout(timer);
      else later(() => show(false), 120);
    }}
    onpointerleave={(e) => {
      if (e.pointerType !== "touch" && !pinned) later(hide, 200);
    }}
  >
    {@render text(trigger)}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
  </button>
  <!-- svelte-ignore a11y_no_static_element_interactions (the keys move between the links inside) -->
  <div
    {...rest}
    bind:this={panel}
    {id}
    popover="auto"
    class={["vin-nav-menu__panel", className].filter(Boolean).join(" ")}
    onkeydown={onPanelKey}
    onpointerenter={(e) => {
      onpointerenter?.(e);
      clearTimeout(timer);
    }}
    onpointerleave={(e) => {
      onpointerleave?.(e);
      if (e.pointerType !== "touch" && !pinned) later(hide, 200);
    }}
  >
    {@render children?.()}
  </div>
</li>
