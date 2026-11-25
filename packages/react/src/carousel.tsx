"use client";

import * as React from "react";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Carousel (React). API: spec/carousel.json.
 * <Carousel label="Featured stays">{stays.map((s) => <StayCard key={s.id} {...s} />)}</Carousel>
 * The track is a native scroll-snap scroller (touch and trackpads just work); the buttons, dots
 * and arrow keys scroll it. No autoplay. Slides that are out of view are inert.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export type CarouselProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** Names the carousel. */
  label: string;
  /** One child per slide. */
  children: React.ReactNode;
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
};

/** Is motion reduced, by the OS or by Customize → Motion? */
function reducedMotion(el: Element) {
  if (el.closest('[data-vin-motion="off"], [data-vin-motion="reduced"]')) return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches && !el.closest('[data-vin-motion="full"]');
}

export function Carousel({ label, children, perView, gap, dots = true, controls = true, onSlideChange, className, style, onKeyDown, ...rest }: CarouselProps) {
  const id = "vin-carousel-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const track = React.useRef<HTMLDivElement>(null);
  const slides = React.Children.toArray(children);
  const count = slides.length;
  const [current, setCurrent] = React.useState(0);
  const [shown, setShown] = React.useState<boolean[] | null>(null);
  const [edges, setEdges] = React.useState({ start: true, end: count <= 1 });
  const changed = React.useRef(onSlideChange);
  changed.current = onSlideChange;
  if (isDev() && !label) console.warn("VinUI Carousel: pass a label, e.g. label=\"Featured stays\".");

  const measure = React.useCallback(() => {
    const t = track.current;
    if (!t) return;
    const box = t.getBoundingClientRect();
    const items = Array.from(t.children) as HTMLElement[];
    const vis = items.map((s) => {
      const r = s.getBoundingClientRect();
      return Math.min(r.right, box.right) - Math.max(r.left, box.left) >= r.width * 0.5 - 1;
    });
    const first = Math.max(0, vis.indexOf(true));
    const max = t.scrollWidth - t.clientWidth, pos = Math.abs(t.scrollLeft);
    setShown((old) => (old && old.length === vis.length && old.every((v, i) => v === vis[i]) ? old : vis));
    setEdges((old) => {
      const next = { start: pos <= 1, end: pos >= max - 1 };
      return old.start === next.start && old.end === next.end ? old : next;
    });
    setCurrent(first);
  }, []);

  const initial = React.useRef(true);
  React.useEffect(() => {
    if (initial.current) { initial.current = false; return; }
    changed.current?.(current);
  }, [current]);

  React.useEffect(() => {
    const t = track.current;
    if (!t) return;
    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    measure();
    t.addEventListener("scroll", schedule, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(t);
    return () => { cancelAnimationFrame(frame); t.removeEventListener("scroll", schedule); ro?.disconnect(); };
  }, [measure, count]);

  const goTo = (i: number) => {
    const t = track.current;
    const slide = t?.children[Math.max(0, Math.min(count - 1, i))] as HTMLElement | undefined;
    if (!t || !slide) return;
    const box = t.getBoundingClientRect(), r = slide.getBoundingClientRect();
    const rtl = getComputedStyle(t).direction === "rtl";
    t.scrollBy({ left: rtl ? r.right - box.right : r.left - box.left, behavior: reducedMotion(t) ? "instant" : "smooth" });
  };
  const step = (by: number) => {
    if ((by < 0 && edges.start) || (by > 0 && edges.end)) return;
    goTo(current + by);
  };

  const onKey = (e: React.KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    const target = e.target as HTMLElement;
    if (target !== track.current && !target.closest(".vin-carousel__controls")) return;
    e.preventDefault();
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    step((e.key === "ArrowRight") !== rtl ? 1 : -1);
  };

  const vars: Record<string, string | number> = {};
  if (perView != null) vars["--vin-carousel-per-view"] = perView;
  if (gap != null) vars["--vin-carousel-gap"] = gap;

  return (
    <section
      {...rest}
      aria-roledescription="carousel"
      aria-label={label}
      className={cx("vin-carousel", className)}
      style={{ ...vars, ...style }}
      onKeyDown={onKey}
    >
      <div className="vin-carousel__track" id={id} ref={track} tabIndex={0} aria-live="polite">
        {slides.map((child, i) => (
          <div
            key={i}
            className="vin-carousel__slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            inert={shown ? !shown[i] : undefined}
          >
            {child}
          </div>
        ))}
      </div>
      {(controls || dots) && (
        <div className="vin-carousel__controls">
          {controls && (
            <button type="button" className="vin-btn vin-btn--outline vin-btn--icon vin-carousel__prev" aria-controls={id} aria-label="Previous slide" aria-disabled={edges.start || undefined} onClick={() => step(-1)}>
              <svg {...svg}><path d="m15 6-6 6 6 6" /></svg>
            </button>
          )}
          {dots && (
            <div className="vin-carousel__dots" role="group" aria-label="Choose a slide">
              {slides.map((_, i) => (
                <button key={i} type="button" className="vin-carousel__dot" aria-controls={id} aria-label={`Slide ${i + 1}`} aria-current={i === current || undefined} onClick={() => goTo(i)} />
              ))}
            </div>
          )}
          {controls && (
            <button type="button" className="vin-btn vin-btn--outline vin-btn--icon vin-carousel__next" aria-controls={id} aria-label="Next slide" aria-disabled={edges.end || undefined} onClick={() => step(1)}>
              <svg {...svg}><path d="m9 6 6 6-6 6" /></svg>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
