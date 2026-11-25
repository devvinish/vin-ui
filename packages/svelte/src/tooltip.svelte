<!--
  VinUI · Tooltip (Svelte). API: spec/tooltip.json.
  Wrap one trigger and spread the props the snippet gets on it:
    <Tooltip content="Add to library">{#snippet children(props)}<Button {...props}>Save</Button>{/snippet}</Tooltip>
  Hover (after `delay`) or keyboard focus shows it; Escape hides it. It sits in the top layer (popover).
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";

  type Side = "top" | "right" | "bottom" | "left";

  /** Spread these on the trigger. */
  export type TooltipTriggerProps = {
    "aria-describedby"?: string;
    "aria-labelledby"?: string;
    onpointerenter: (e: PointerEvent) => void;
    onpointerleave: (e: PointerEvent) => void;
    onpointerdown: (e: PointerEvent) => void;
    onfocus: (e: FocusEvent) => void;
    onblur: (e: FocusEvent) => void;
    [key: symbol]: Attachment<HTMLElement>;
  };

  export type TooltipProps = {
    content: string | Snippet;
    /** The trigger: a snippet that spreads the props it gets. */
    children: Snippet<[TooltipTriggerProps]>;
    side?: Side;
    /** The tooltip is the trigger's name (icon buttons): aria-labelledby instead of aria-describedby. */
    label?: boolean;
    /** Milliseconds before it shows on hover. Default 300. */
    delay?: number;
    class?: string;
  };

  /** Place `el` next to `anchor`, flipping to the other side if there's no room, and keep it on screen. */
  function place(el: HTMLElement, anchor: HTMLElement, side: Side, align: "start" | "center" | "end", gap: number) {
    const r = anchor.getBoundingClientRect(),
      w = el.offsetWidth,
      h = el.offsetHeight;
    const vw = document.documentElement.clientWidth,
      vh = window.innerHeight,
      m = 8;
    const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
    const fits = { top: r.top - gap - h >= m, bottom: r.bottom + gap + h <= vh - m, left: r.left - gap - w >= m, right: r.right + gap + w <= vw - m };
    if (!fits[side] && fits[opposite[side]]) side = opposite[side];
    if (getComputedStyle(anchor).direction === "rtl") align = align === "start" ? "end" : align === "end" ? "start" : align;
    let x: number, y: number;
    if (side === "top" || side === "bottom") {
      y = side === "top" ? r.top - gap - h : r.bottom + gap;
      x = align === "start" ? r.left : align === "end" ? r.right - w : r.left + (r.width - w) / 2;
    } else {
      x = side === "left" ? r.left - gap - w : r.right + gap;
      y = align === "start" ? r.top : align === "end" ? r.bottom - h : r.top + (r.height - h) / 2;
    }
    el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
    el.style.top = `${Math.max(m, Math.min(y, vh - h - m))}px`;
    el.setAttribute("data-placed", side);
  }
</script>

<script lang="ts">
  import { onDestroy } from "svelte";
  import { createAttachmentKey } from "svelte/attachments";

  let { content, children, side = "top", label = false, delay = 300, class: className }: TooltipProps = $props();

  const uid = $props.id();
  const id = `vin-tip-${uid}`;
  let tip = $state<HTMLDivElement>();
  let trigger: HTMLElement | undefined;
  const timers: { show?: ReturnType<typeof setTimeout>; hide?: ReturnType<typeof setTimeout> } = {};

  const isOpen = () => !!tip?.matches(":popover-open");
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen()) {
      e.stopPropagation();
      hide(true);
    }
  };
  function show(now = false) {
    clearTimeout(timers.hide);
    clearTimeout(timers.show);
    timers.show = setTimeout(
      () => {
        const el = tip,
          anchor = trigger;
        if (!el || !anchor) return;
        if (!isOpen()) el.showPopover?.();
        place(el, anchor, side, "center", 6);
        document.addEventListener("keydown", onKey, true);
      },
      now ? 0 : delay,
    );
  }
  function hide(now = false) {
    clearTimeout(timers.show);
    clearTimeout(timers.hide);
    timers.hide = setTimeout(
      () => {
        if (isOpen()) tip?.hidePopover?.();
        document.removeEventListener("keydown", onKey, true);
      },
      now ? 0 : 100,
    );
  }
  onDestroy(() => {
    clearTimeout(timers.show);
    clearTimeout(timers.hide);
    if (typeof document !== "undefined") document.removeEventListener("keydown", onKey, true);
  });

  const ref = createAttachmentKey();
  const attach: Attachment<HTMLElement> = (node) => {
    trigger = node;
    return () => {
      if (trigger === node) trigger = undefined;
    };
  };
  const triggerProps = $derived<TooltipTriggerProps>({
    [label ? "aria-labelledby" : "aria-describedby"]: id,
    onpointerenter: (e: PointerEvent) => {
      if (e.pointerType !== "touch") show();
    },
    onpointerleave: () => hide(),
    onpointerdown: () => hide(true),
    onfocus: (e: FocusEvent) => {
      if ((e.target as HTMLElement).matches(":focus-visible")) show(true);
    },
    onblur: () => hide(true),
    [ref]: attach,
  });
</script>

{@render children(triggerProps)}
<div
  bind:this={tip}
  {id}
  role="tooltip"
  popover="manual"
  data-side={side}
  class={["vin-tooltip", className].filter(Boolean).join(" ")}
  onpointerenter={() => clearTimeout(timers.hide)}
  onpointerleave={() => hide()}
>
  {#if typeof content === "function"}{@render content()}{:else}{content}{/if}
</div>
