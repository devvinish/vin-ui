<!--
  VinUI · Message Scroller (Svelte). API: spec/message-scroller.json.
  A chat log that stays pinned to the newest message while you're at the bottom.
  Scroll up and it stops following; a "Jump to latest" button brings you back.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** Name for the log. Default: "Conversation". */
    label?: string;
    /** Draw a frame (surface, border, rounded corners). */
    outline?: boolean;
    /** Text of the jump button. Default: "Jump to latest". */
    jumpLabel?: string;
    /** How close to the bottom (px) still counts as "at the bottom". Default: 32. */
    threshold?: number;
    /** Props for the scrolling element (the log). */
    viewportProps?: Omit<HTMLAttributes<HTMLDivElement>, "class"> & { class?: string };
    class?: string;
    children?: Snippet;
  };
  let {
    label = "Conversation",
    outline = false,
    jumpLabel = "Jump to latest",
    threshold = 32,
    viewportProps,
    class: className,
    children,
    ...rest
  }: Props = $props();

  const reducedMotion = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || /^(reduced|off)$/.test(document.documentElement.getAttribute("data-vin-motion") ?? "");

  let view = $state<HTMLDivElement>();
  let content = $state<HTMLDivElement>();
  let away = $state(false);
  let fresh = $state(false);
  let stuck = true;
  let pinning = false;

  const atBottom = () => !view || view.scrollHeight - view.scrollTop - view.clientHeight <= threshold;
  const toBottom = (smooth: boolean) => {
    view?.scrollTo?.({ top: view.scrollHeight, behavior: smooth && !reducedMotion() ? "smooth" : "auto" });
  };

  $effect(() => {
    const v = view,
      c = content;
    if (!v || !c) return;
    toBottom(false);
    let lastTop = v.scrollTop;
    const onScroll = () => {
      // Only scrolling up lets go: content growing (or the browser re-anchoring it) never does.
      const top = v.scrollTop,
        bottom = atBottom(),
        up = top < lastTop - 1;
      lastTop = top;
      if (pinning) {
        if (!bottom) return;
        pinning = false;
      }
      if (bottom) {
        stuck = true;
        away = false;
        fresh = false;
      } else if (up) {
        stuck = false;
        away = true;
      }
    };
    const cancel = () => {
      pinning = false;
    };
    v.addEventListener("scroll", onScroll, { passive: true });
    v.addEventListener("wheel", cancel, { passive: true });
    v.addEventListener("touchstart", cancel, { passive: true });
    v.addEventListener("keydown", cancel);
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (stuck || pinning) toBottom(pinning);
            else if (!atBottom()) {
              away = true;
              fresh = true;
            }
          })
        : null;
    ro?.observe(c);
    return () => {
      ro?.disconnect();
      v.removeEventListener("scroll", onScroll);
      v.removeEventListener("wheel", cancel);
      v.removeEventListener("touchstart", cancel);
      v.removeEventListener("keydown", cancel);
    };
  });

  function jump() {
    stuck = true;
    pinning = true;
    away = false;
    fresh = false;
    view?.focus({ preventScroll: true });
    toBottom(true);
  }
</script>

<div {...rest} class={["vin-message-scroller", outline && "vin-message-scroller--outline", className].filter(Boolean).join(" ")}>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (the log scrolls, so keyboard users need to reach it) -->
  <div
    role="log"
    aria-live="polite"
    aria-label={label}
    tabindex="0"
    {...viewportProps}
    bind:this={view}
    class={["vin-message-scroller__viewport", viewportProps?.class].filter(Boolean).join(" ")}
  >
    <div class="vin-message-scroller__content" bind:this={content}>{@render children?.()}</div>
  </div>
  <button
    type="button"
    class="vin-btn vin-btn--secondary vin-btn--sm vin-message-scroller__jump"
    hidden={!away}
    data-new={(away && fresh) || undefined}
    onclick={jump}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
      ><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg
    >
    {jumpLabel}
  </button>
</div>
