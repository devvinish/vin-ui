<!--
  VinUI · Carousel (Svelte). API: spec/carousel.json.
    <Carousel label="Featured stays" items={stays}>
      {#snippet children(stay)}<StayCard {...stay} />{/snippet}
    </Carousel>
  One slide per item. The track is a native scroll-snap scroller (touch and trackpads just work);
  the buttons, dots and arrow keys scroll it. No autoplay. Slides that are out of view are inert.
-->
<script lang="ts" module>
  /** Is motion reduced, by the OS or by Customize → Motion? */
  function reducedMotion(el: Element) {
    if (el.closest('[data-vin-motion="off"], [data-vin-motion="reduced"]')) return true;
    return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches && !el.closest('[data-vin-motion="full"]');
  }
</script>

<script lang="ts" generics="T">
  import { untrack, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class" | "children" | "style"> & {
    /** Names the carousel. */
    label: string;
    /** One slide per item. */
    items: T[];
    /** Renders a slide. */
    children: Snippet<[T, number]>;
    /** Slides shown at once; fractions show a peek. Default 1. */
    perView?: number;
    /** Space between slides, e.g. "16px". Default 12px. */
    gap?: string;
    /** A dot per slide. Default true. */
    dots?: boolean;
    /** Previous and next buttons. Default true. */
    controls?: boolean;
    /** Called with the first fully shown slide (0-based). */
    onSlideChange?: (index: number) => void;
    class?: string;
    style?: string;
  };
  let {
    label,
    items,
    children,
    perView,
    gap,
    dots = true,
    controls = true,
    onSlideChange,
    class: className,
    style,
    onkeydown,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const id = `vin-carousel-${uid}`;
  let track = $state<HTMLDivElement>();
  const count = $derived(items.length);
  let current = $state(0);
  let shown = $state.raw<boolean[] | null>(null);
  const initialEdges = () => ({ start: true, end: items.length <= 1 });
  let edges = $state.raw(initialEdges());

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !label) console.warn('VinUI Carousel: pass a label, e.g. label="Featured stays".');
  };
  warnIfUnnamed();

  function measure() {
    const t = track;
    if (!t) return;
    const box = t.getBoundingClientRect();
    const slides = Array.from(t.children) as HTMLElement[];
    const vis = slides.map((s) => {
      const r = s.getBoundingClientRect();
      return Math.min(r.right, box.right) - Math.max(r.left, box.left) >= r.width * 0.5 - 1;
    });
    const first = Math.max(0, vis.indexOf(true));
    const max = t.scrollWidth - t.clientWidth,
      pos = Math.abs(t.scrollLeft);
    if (!shown || shown.length !== vis.length || shown.some((v, i) => v !== vis[i])) shown = vis;
    const next = { start: pos <= 1, end: pos >= max - 1 };
    if (edges.start !== next.start || edges.end !== next.end) edges = next;
    if (first !== current) {
      current = first;
      onSlideChange?.(first);
    }
  }

  $effect(() => {
    const t = track;
    void count;
    if (!t) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    untrack(measure);
    t.addEventListener("scroll", schedule, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(t);
    return () => {
      cancelAnimationFrame(frame);
      t.removeEventListener("scroll", schedule);
      ro?.disconnect();
    };
  });

  function goTo(i: number) {
    const t = track;
    const slide = t?.children[Math.max(0, Math.min(count - 1, i))] as HTMLElement | undefined;
    if (!t || !slide) return;
    const box = t.getBoundingClientRect(),
      r = slide.getBoundingClientRect();
    const rtl = getComputedStyle(t).direction === "rtl";
    t.scrollBy?.({ left: rtl ? r.right - box.right : r.left - box.left, behavior: reducedMotion(t) ? "instant" : "smooth" });
  }
  function step(by: number) {
    if ((by < 0 && edges.start) || (by > 0 && edges.end)) return;
    goTo(current + by);
  }

  function onKey(e: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
    onkeydown?.(e);
    if (e.defaultPrevented || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    const target = e.target as HTMLElement;
    if (target !== track && !target.closest(".vin-carousel__controls")) return;
    e.preventDefault();
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    step(e.key === "ArrowRight" !== rtl ? 1 : -1);
  }

  const vars = $derived(
    [perView != null && `--vin-carousel-per-view: ${perView}`, gap != null && `--vin-carousel-gap: ${gap}`, style].filter(Boolean).join("; ") || undefined,
  );
</script>

<section {...rest} aria-roledescription="carousel" aria-label={label} class={["vin-carousel", className].filter(Boolean).join(" ")} style={vars} onkeydown={onKey}>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (the track scrolls, so keyboard users need to reach it) -->
  <div class="vin-carousel__track" {id} bind:this={track} tabindex="0" aria-live="polite">
    {#each items as item, i (i)}
      <div class="vin-carousel__slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} inert={shown ? !shown[i] : undefined}>
        {@render children(item, i)}
      </div>
    {/each}
  </div>
  {#if controls || dots}
    <div class="vin-carousel__controls">
      {#if controls}
        <button
          type="button"
          class="vin-btn vin-btn--outline vin-btn--icon vin-carousel__prev"
          aria-controls={id}
          aria-label="Previous slide"
          aria-disabled={edges.start || undefined}
          onclick={() => step(-1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
            ><path d="m15 6-6 6 6 6" /></svg
          >
        </button>
      {/if}
      {#if dots}
        <div class="vin-carousel__dots" role="group" aria-label="Choose a slide">
          {#each items as _, i (i)}
            <button
              type="button"
              class="vin-carousel__dot"
              aria-controls={id}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === current || undefined}
              onclick={() => goTo(i)}
            ></button>
          {/each}
        </div>
      {/if}
      {#if controls}
        <button
          type="button"
          class="vin-btn vin-btn--outline vin-btn--icon vin-carousel__next"
          aria-controls={id}
          aria-label="Next slide"
          aria-disabled={edges.end || undefined}
          onclick={() => step(1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
            ><path d="m9 6 6 6-6 6" /></svg
          >
        </button>
      {/if}
    </div>
  {/if}
</section>
