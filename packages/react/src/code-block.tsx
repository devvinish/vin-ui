"use client";

import * as React from "react";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Code Block (React). API: spec/code-block.json.
 * <CodeBlock code={source} filename="app.tsx" language="tsx" lineNumbers highlight={[3, 4]} />
 * No syntax highlighter is bundled: pass plain `code`, or `html` that Shiki, Prism or the
 * vin-code-block__{keyword|string|number|comment} classes already highlighted.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const CopyIcon = () => <svg {...svg}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>;
const CheckIcon = () => <svg {...svg}><path d="M20 6 9 17l-5-5" /></svg>;

/** Copy text, with a fallback for pages that aren't a secure context. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

export type CodeBlockProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The code as plain text. */
  code?: string;
  /** Already-highlighted HTML, used instead of `code`. Only pass HTML you trust. */
  html?: string;
  /** File name, shown in the header. */
  filename?: React.ReactNode;
  /** Short language label, shown in the header. */
  language?: string;
  lineNumbers?: boolean;
  /** Lines to highlight, starting at 1. */
  highlight?: number[];
  /** Name of the copy button. Default: "Copy code". */
  copyLabel?: string;
  /** Hide the copy button. */
  copyable?: boolean;
};

const textOf = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

export function CodeBlock({
  code, html, filename, language, lineNumbers = false, highlight, copyLabel = "Copy code", copyable = true, className, style, ...rest
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  if (isDev() && code == null && html == null) console.warn("VinUI CodeBlock: pass `code` or `html`.");
  const source = (html ?? code ?? "").replace(/\n$/, "");
  const plain = html != null ? textOf(source) : source;
  const byLine = lineNumbers || (highlight?.length ?? 0) > 0;
  const marks = new Set(highlight);
  const lines = byLine ? source.split("\n") : [];

  const onCopy = async () => {
    const ok = await copyText(plain);
    clearTimeout(timer.current);
    setCopied(ok);
    setStatus(ok ? "Copied" : "Couldn't copy");
    timer.current = window.setTimeout(() => { setCopied(false); setStatus(""); }, 2000);
  };

  const copyButton = copyable && (
    <button
      type="button"
      className="vin-btn vin-btn--ghost vin-btn--icon vin-btn--sm vin-code-block__copy"
      aria-label={copyLabel}
      data-copied={copied ? "" : undefined}
      onClick={onCopy}
    >
      <CopyIcon /><CheckIcon />
    </button>
  );
  const header = filename != null || language != null;
  const gutter = lineNumbers && lines.length > 99 ? `${String(lines.length).length}ch` : undefined;

  return (
    <div
      {...rest}
      className={cx("vin-code-block", lineNumbers && "vin-code-block--numbered", className)}
      style={gutter ? { ...style, ["--vin-code-gutter" as string]: gutter } : style}
    >
      {header ? (
        <div className="vin-code-block__header">
          {filename != null && <span className="vin-code-block__title">{filename}</span>}
          {language != null && <span className="vin-code-block__lang">{language}</span>}
          {copyButton}
        </div>
      ) : copyButton}
      <pre className="vin-code-block__pre" tabIndex={0}>
        {byLine ? (
          <code>
            {lines.map((line, i) => {
              const cls = cx("vin-code-block__line", marks.has(i + 1) && "vin-code-block__line--highlight");
              return html != null
                ? <span key={i} className={cls} dangerouslySetInnerHTML={{ __html: line }} />
                : <span key={i} className={cls}>{line}</span>;
            })}
          </code>
        ) : html != null ? (
          <code dangerouslySetInnerHTML={{ __html: source }} />
        ) : (
          <code>{source}</code>
        )}
      </pre>
      {copyable && <span className="vin-code-block__status" role="status">{status}</span>}
    </div>
  );
}
