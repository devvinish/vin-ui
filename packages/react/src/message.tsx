"use client";

import * as React from "react";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Message (React). API: spec/message.json.
 * One chat message: avatar, author and time, the content, and small icon actions
 * (copy, retry, thumbs up and down).
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const CopyIcon = () => <Icon><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>;
const ThumbUpIcon = () => <Icon><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" /></Icon>;
const ThumbDownIcon = () => <Icon><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" /></Icon>;

export type MessageProps = React.HTMLAttributes<HTMLElement> & {
  /** Who wrote it, shown above the content. */
  author?: React.ReactNode;
  /** Usually an Avatar. It is hidden from screen readers, because the author name says who it is. */
  avatar?: React.ReactNode;
  /** The time to show, e.g. "10:42". */
  time?: React.ReactNode;
  /** Machine-readable time (ISO). With it, the time is a <time> element. */
  dateTime?: string;
  /** "end" puts the avatar on the end side, for the person's own messages. Default: "start". */
  align?: "start" | "end";
  /** The reply is still being written: shows a caret and sets aria-busy. */
  streaming?: boolean;
  /** Icon actions under the content: MessageCopy, MessageFeedback, MessageAction. */
  actions?: React.ReactNode;
  /** Name for the actions group. Default: "Message actions". */
  actionsLabel?: string;
};

export function Message({
  author, avatar, time, dateTime, align = "start", streaming, actions, actionsLabel = "Message actions", className, children, ...rest
}: MessageProps) {
  const TimeTag = dateTime ? "time" : "span";
  return (
    <article
      aria-busy={streaming || undefined}
      {...rest}
      className={cx("vin-message", align === "end" && "vin-message--end", streaming && "vin-message--streaming", className)}
    >
      {avatar != null && <div className="vin-message__avatar" aria-hidden="true">{avatar}</div>}
      <div className="vin-message__body">
        {(author != null || time != null) && (
          <header className="vin-message__header">
            {author != null && <p className="vin-message__author">{author}</p>}
            {time != null && <TimeTag className="vin-message__time" dateTime={dateTime}>{time}</TimeTag>}
          </header>
        )}
        <div className="vin-message__content">{children}</div>
        {actions != null && <div className="vin-message__actions" role="group" aria-label={actionsLabel}>{actions}</div>}
      </div>
    </article>
  );
}

export type MessageActionProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  /** What the button does. Screen readers read it; the button only shows an icon. */
  label: string;
  /** For toggles: pressed or not (sets aria-pressed). */
  pressed?: boolean;
};

/** A small icon button for the actions row. Put an SVG inside. */
export function MessageAction({ label, pressed, className, type = "button", ...rest }: MessageActionProps) {
  if (isDev() && !label) console.warn("VinUI MessageAction: give it a label so screen readers can name it.");
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      aria-pressed={pressed === undefined ? undefined : pressed}
      className={cx("vin-btn vin-btn--ghost vin-btn--icon", className)}
    />
  );
}

export type MessageCopyProps = Omit<MessageActionProps, "label" | "children"> & {
  /** The text to copy. Default: the message's content. */
  text?: string;
  label?: string;
  /** The label for two seconds after copying. Default: "Copied". */
  copiedLabel?: string;
};

/** Copies the message (or `text`) to the clipboard and says "Copied" for two seconds. */
export function MessageCopy({ text, label = "Copy", copiedLabel = "Copied", onClick, ...rest }: MessageCopyProps) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <MessageAction
      {...rest}
      label={copied ? copiedLabel : label}
      data-copied={copied || undefined}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        const value = text ?? e.currentTarget.closest(".vin-message")?.querySelector(".vin-message__content")?.textContent?.trim() ?? "";
        navigator.clipboard?.writeText(value).catch(() => {});
        setCopied(true);
      }}
    >
      <CopyIcon />
    </MessageAction>
  );
}

export type Feedback = "up" | "down" | null;
export type MessageFeedbackProps = {
  value?: Feedback;
  defaultValue?: Feedback;
  onValueChange?: (value: Feedback) => void;
  /** Default: "Good response". */
  upLabel?: string;
  /** Default: "Bad response". */
  downLabel?: string;
};

/** Thumbs up and down. One can be pressed at a time; pressing it again clears it. */
export function MessageFeedback({ value, defaultValue = null, onValueChange, upLabel = "Good response", downLabel = "Bad response" }: MessageFeedbackProps) {
  const [inner, setInner] = React.useState<Feedback>(defaultValue);
  const current = value === undefined ? inner : value;
  const choose = (v: "up" | "down") => {
    const next = current === v ? null : v;
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };
  return (
    <>
      <MessageAction label={upLabel} pressed={current === "up"} onClick={() => choose("up")}><ThumbUpIcon /></MessageAction>
      <MessageAction label={downLabel} pressed={current === "down"} onClick={() => choose("down")}><ThumbDownIcon /></MessageAction>
    </>
  );
}
