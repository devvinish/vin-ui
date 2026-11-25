"use client";

import * as React from "react";

/*
 * VinUI · Accordion (React). API: spec/accordion.json.
 * Native <details>: the browser handles keyboard and find-in-page. type="single" keeps one open (same name on every item).
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type AccordionItem = { value: string; title: React.ReactNode; content: React.ReactNode };

export type AccordionProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> & {
  items: AccordionItem[];
  type?: "single" | "multiple";
  /** Open items (controlled). */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  variant?: "default" | "outline";
};

export function Accordion({ items, type = "single", value, defaultValue = [], onValueChange, variant = "default", className, ...rest }: AccordionProps) {
  const name = "vin-acc-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [inner, setInner] = React.useState(defaultValue);
  const open = value ?? inner;
  const latest = React.useRef(open);
  latest.current = open;
  const set = (next: string[]) => {
    latest.current = next;
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };
  const onToggle = (v: string) => (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const isOpen = e.currentTarget.open;
    const cur = latest.current;
    if (isOpen && !cur.includes(v)) set(type === "single" ? [v] : [...cur, v]);
    if (!isOpen && cur.includes(v)) set(cur.filter((x) => x !== v));
  };
  return (
    <div {...rest} className={cx("vin-accordion", variant === "outline" && "vin-accordion--outline", className)}>
      {items.map((item) => (
        <details key={item.value} className="vin-accordion__item" name={type === "single" ? name : undefined} open={open.includes(item.value)} onToggle={onToggle(item.value)}>
          <summary className="vin-accordion__trigger">{item.title}</summary>
          <div className="vin-accordion__content">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
