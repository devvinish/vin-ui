<!--
  VinUI · Popover (Svelte). API: spec/popover.json.
  The browser's popover: Escape and a click outside close it. This places it next to the trigger.
    <Popover title="Dimensions">
      {#snippet trigger(props)}<Button {...props}>Dimensions</Button>{/snippet}
      …
    </Popover>
  bind:open works.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import type { HTMLAttributes } from "svelte/elements";

  type Side = "top" | "right" | "bottom" | "left";
  type Align = "start" | "center" | "end";

  /** Spread these on the button that opens the popover. */
  export type PopoverTriggerProps = { popovertarget: string; "aria-expanded": boolean; [key: symbol]: Attachment<HTMLElement> };

  export type PopoverProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "title"> & {
    /** The button that opens it: a snippet that spreads the props it gets. */
    trigger: Snippet<[PopoverTriggerProps]>;
    title?: string | Snippet;
    description?: string | Snippet;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: Side;
    align?: Align;
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
  import { createAttachmentKey } from "svelte/attachments";

  let {
    trigger,
    title,
    description,
    open = $bindable(false),
    onOpenChange,
    side = "bottom",
    align = "start",
    class: className,
    children,
    ...rest
  }: PopoverProps = $props();

  const uid = $props.id();
  const id = `vin-pop-${uid}`;
  let pop = $state<HTMLDivElement>();
  let btn: HTMLElement | undefined;
  const ref = createAttachmentKey();
  const attach: Attachment<HTMLElement> = (node) => {
    btn = node;
    return () => {
      if (btn === node) btn = undefined;
    };
  };
  const triggerProps = $derived<PopoverTriggerProps>({ popovertarget: id, "aria-expanded": open, [ref]: attach });

  // Follow the browser's open/close (Escape, click outside), and keep it placed while open.
  $effect(() => {
    const el = pop;
    if (!el) return;
    const s = side,
      a = align;
    const reposition = () => btn && place(el, btn, s, a, 6);
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
    const el = pop;
    if (!el?.showPopover) return;
    const shown = el.matches(":popover-open");
    if (open && !shown) el.showPopover();
    if (!open && shown) el.hidePopover();
  });
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

{@render trigger(triggerProps)}
<div
  {...rest}
  bind:this={pop}
  {id}
  popover="auto"
  role="dialog"
  aria-labelledby={title != null ? `${id}-title` : undefined}
  data-side={side}
  data-align={align}
  class={["vin-popover", className].filter(Boolean).join(" ")}
>
  {#if title != null}<p class="vin-popover__title" id={`${id}-title`}>{@render text(title)}</p>{/if}
  {#if description != null}<p class="vin-popover__description">{@render text(description)}</p>{/if}
  {@render children?.()}
</div>
