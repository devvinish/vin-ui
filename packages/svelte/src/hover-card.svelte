<!--
  VinUI · Hover Card (Svelte). API: spec/hover-card.json.
  A Popover that opens when the pointer rests on its trigger (after openDelay) or the trigger gets
  keyboard focus. The pointer can move onto the card; Esc closes it.
    <HoverCard>
      {#snippet trigger(props)}<Link href="/u/ada" {...props}>@ada</Link>{/snippet}
      <p class="vin-popover__title">Ada Lovelace</p>
    </HoverCard>
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import type { HTMLAttributes } from "svelte/elements";

  type Side = "top" | "bottom" | "left" | "right";

  /** Spread these on the link (or button) the card previews. */
  export type HoverCardTriggerProps = {
    onpointerenter: (e: PointerEvent) => void;
    onpointerleave: (e: PointerEvent) => void;
    onfocus: (e: FocusEvent) => void;
    onblur: (e: FocusEvent) => void;
    [key: symbol]: Attachment<HTMLElement>;
  };

  export type HoverCardProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "popover"> & {
    /** The link (or button) it previews: a snippet that spreads the props it gets. */
    trigger: Snippet<[HoverCardTriggerProps]>;
    side?: Side;
    /** Milliseconds before it opens on hover. Default 500. */
    openDelay?: number;
    /** Milliseconds before it closes after the pointer leaves. Default 300. */
    closeDelay?: number;
    onOpenChange?: (open: boolean) => void;
    class?: string;
    children?: Snippet;
  };

  function place(el: HTMLElement, anchor: HTMLElement, side: Side, gap: number) {
    const r = anchor.getBoundingClientRect(),
      w = el.offsetWidth,
      h = el.offsetHeight;
    const vw = document.documentElement.clientWidth,
      vh = window.innerHeight,
      m = 8;
    const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
    const fits = { top: r.top - gap - h >= m, bottom: r.bottom + gap + h <= vh - m, left: r.left - gap - w >= m, right: r.right + gap + w <= vw - m };
    if (!fits[side] && fits[opposite[side]]) side = opposite[side];
    let x: number, y: number;
    if (side === "top" || side === "bottom") {
      y = side === "top" ? r.top - gap - h : r.bottom + gap;
      x = r.left + (r.width - w) / 2;
    } else {
      x = side === "left" ? r.left - gap - w : r.right + gap;
      y = r.top + (r.height - h) / 2;
    }
    el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
    el.style.top = `${Math.max(m, Math.min(y, vh - h - m))}px`;
    el.setAttribute("data-placed", side);
  }
</script>

<script lang="ts">
  import { createAttachmentKey } from "svelte/attachments";

  let {
    trigger,
    side = "bottom",
    openDelay = 500,
    closeDelay = 300,
    onOpenChange,
    class: className,
    children,
    onpointerenter,
    onpointerleave,
    onfocusin,
    onfocusout,
    ...rest
  }: HoverCardProps = $props();

  let card = $state<HTMLDivElement>();
  let anchor: HTMLElement | undefined;
  const timers: { show?: ReturnType<typeof setTimeout>; hide?: ReturnType<typeof setTimeout> } = {};

  const isOpen = () => !!card?.matches(":popover-open");
  function show(delay: number) {
    clearTimeout(timers.hide);
    clearTimeout(timers.show);
    timers.show = setTimeout(() => {
      const el = card,
        a = anchor;
      if (!el?.showPopover || !a) return;
      if (!isOpen()) {
        el.showPopover();
        onOpenChange?.(true);
      }
      place(el, a, side, 8);
    }, delay);
  }
  function hide(delay: number) {
    clearTimeout(timers.show);
    clearTimeout(timers.hide);
    timers.hide = setTimeout(() => {
      if (isOpen()) {
        card?.hidePopover();
        onOpenChange?.(false);
      }
    }, delay);
  }

  $effect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        e.stopPropagation();
        hide(0);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      clearTimeout(timers.show);
      clearTimeout(timers.hide);
    };
  });

  const ref = createAttachmentKey();
  const attach: Attachment<HTMLElement> = (node) => {
    anchor = node;
    return () => {
      if (anchor === node) anchor = undefined;
    };
  };
  const triggerProps: HoverCardTriggerProps = {
    onpointerenter: (e) => {
      if (e.pointerType !== "touch") show(openDelay);
    },
    onpointerleave: () => hide(closeDelay),
    onfocus: (e) => {
      if ((e.currentTarget as HTMLElement).matches(":focus-visible")) show(0);
    },
    onblur: () => hide(150),
    [ref]: attach,
  };
</script>

{@render trigger(triggerProps)}
<!-- svelte-ignore a11y_no_static_element_interactions (the pointer and focus handlers only keep the card open) -->
<div
  {...rest}
  bind:this={card}
  popover="manual"
  data-side={side === "bottom" ? undefined : side}
  class={["vin-popover", "vin-hover-card", className].filter(Boolean).join(" ")}
  onpointerenter={(e) => {
    onpointerenter?.(e);
    clearTimeout(timers.hide);
  }}
  onpointerleave={(e) => {
    onpointerleave?.(e);
    hide(closeDelay);
  }}
  onfocusin={(e) => {
    onfocusin?.(e);
    clearTimeout(timers.hide);
  }}
  onfocusout={(e) => {
    onfocusout?.(e);
    if (!e.currentTarget.contains(e.relatedTarget as Node) && e.relatedTarget !== anchor) hide(150);
  }}
>
  {@render children?.()}
</div>
