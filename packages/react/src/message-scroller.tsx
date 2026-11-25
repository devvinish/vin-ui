"use client";

import * as React from "react";

/*
 * VinUI · Message Scroller (React). API: spec/message-scroller.json.
 * A chat log that stays pinned to the newest message while you're at the bottom.
 * Scroll up and it stops following; a "Jump to latest" button brings you back.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

const reducedMotion = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || /^(reduced|off)$/.test(document.documentElement.getAttribute("data-vin-motion") ?? ""));

export type MessageScrollerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Name for the log. Default: "Conversation". */
  label?: string;
  /** Draw a frame (surface, border, rounded corners). */
  outline?: boolean;
  /** Text of the jump button. Default: "Jump to latest". */
  jumpLabel?: string;
  /** How close to the bottom (px) still counts as "at the bottom". Default: 32. */
  threshold?: number;
  /** Props for the scrolling element (the log). */
  viewportProps?: React.HTMLAttributes<HTMLDivElement>;
};

export function MessageScroller({
  label = "Conversation", outline, jumpLabel = "Jump to latest", threshold = 32, viewportProps, className, children, ...rest
}: MessageScrollerProps) {
  const view = React.useRef<HTMLDivElement>(null);
  const content = React.useRef<HTMLDivElement>(null);
  const stuck = React.useRef(true);
  const pinning = React.useRef(false);
  const [away, setAway] = React.useState(false);
  const [fresh, setFresh] = React.useState(false);

  const atBottom = React.useCallback(() => {
    const v = view.current;
    return !v || v.scrollHeight - v.scrollTop - v.clientHeight <= threshold;
  }, [threshold]);
  const toBottom = (smooth: boolean) => {
    const v = view.current;
    if (v) v.scrollTo({ top: v.scrollHeight, behavior: smooth && !reducedMotion() ? "smooth" : "auto" });
  };

  React.useEffect(() => {
    const v = view.current, c = content.current;
    if (!v || !c) return;
    toBottom(false);
    let lastTop = v.scrollTop;
    const onScroll = () => {
      // Only scrolling up lets go: content growing (or the browser re-anchoring it) never does.
      const top = v.scrollTop, bottom = atBottom(), up = top < lastTop - 1;
      lastTop = top;
      if (pinning.current) { if (!bottom) return; pinning.current = false; }
      if (bottom) { stuck.current = true; setAway(false); setFresh(false); }
      else if (up) { stuck.current = false; setAway(true); }
    };
    const cancel = () => { pinning.current = false; };
    v.addEventListener("scroll", onScroll, { passive: true });
    v.addEventListener("wheel", cancel, { passive: true });
    v.addEventListener("touchstart", cancel, { passive: true });
    v.addEventListener("keydown", cancel);
    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          if (stuck.current || pinning.current) toBottom(pinning.current);
          else if (!atBottom()) { setAway(true); setFresh(true); }
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
  }, [atBottom]);

  return (
    <div {...rest} className={cx("vin-message-scroller", outline && "vin-message-scroller--outline", className)}>
      <div
        role="log"
        aria-live="polite"
        aria-label={label}
        tabIndex={0}
        {...viewportProps}
        ref={view}
        className={cx("vin-message-scroller__viewport", viewportProps?.className)}
      >
        <div className="vin-message-scroller__content" ref={content}>{children}</div>
      </div>
      <button
        type="button"
        className="vin-btn vin-btn--secondary vin-btn--sm vin-message-scroller__jump"
        hidden={!away}
        data-new={(away && fresh) || undefined}
        onClick={() => {
          stuck.current = true;
          pinning.current = true;
          setAway(false);
          setFresh(false);
          view.current?.focus({ preventScroll: true });
          toBottom(true);
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
        {jumpLabel}
      </button>
    </div>
  );
}
