import * as React from "react";

/*
 * VinUI · Bubble (React). API: spec/bubble.json.
 * A chat bubble: the assistant on the start side, the person on the end side in the accent tint.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type BubbleProps = React.HTMLAttributes<HTMLElement> & {
  /** Who is speaking. "user" sits on the end side, tinted with the accent. Default: "assistant". */
  from?: "assistant" | "user";
  /** With from="user": a solid accent fill instead of a tint. */
  solid?: boolean;
  /** The element to render. Use "p" for a single line of text. Default: "div". */
  as?: "div" | "p";
};

export function Bubble({ from = "assistant", solid, as: Tag = "div", className, ...rest }: BubbleProps) {
  return <Tag {...rest} className={cx("vin-bubble", from === "user" && "vin-bubble--user", from === "user" && solid && "vin-bubble--solid", className)} />;
}

/** A column of bubbles. Bubbles from the same speaker sit close together. */
export function BubbleGroup({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cx("vin-bubble-group", className)} />;
}

export type TypingBubbleProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** What screen readers hear. Default: "Assistant is typing". */
  label?: string;
};

/** Three animated dots while a reply is on its way. They stay still for people who reduce motion. */
export function TypingBubble({ label = "Assistant is typing", className, ...rest }: TypingBubbleProps) {
  return (
    <div role="status" {...rest} className={cx("vin-bubble vin-bubble--typing", className)}>
      <span className="vin-bubble__dot" />
      <span className="vin-bubble__dot" />
      <span className="vin-bubble__dot" />
      <span className="vin-bubble__label">{label}</span>
    </div>
  );
}
