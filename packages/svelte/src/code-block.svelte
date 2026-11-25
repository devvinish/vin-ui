<!--
  VinUI · Code Block (Svelte). API: spec/code-block.json.
    <CodeBlock code={source} filename="app.ts" language="ts" lineNumbers highlight={[3, 4]} />
  No syntax highlighter is bundled: pass plain `code`, or `html` that Shiki, Prism or the
  vin-code-block__{keyword|string|number|comment} classes already highlighted.
-->
<script lang="ts" module>
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
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      ta.remove();
      return ok;
    }
  }

  const textOf = (html: string) =>
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    /** The code as plain text. */
    code?: string;
    /** Already-highlighted HTML, used instead of `code`. Only pass HTML you trust. */
    html?: string;
    /** File name, shown in the header. */
    filename?: string | Snippet;
    /** Short language label, shown in the header. */
    language?: string;
    lineNumbers?: boolean;
    /** Lines to highlight, starting at 1. */
    highlight?: number[];
    /** Name of the copy button. Default: "Copy code". */
    copyLabel?: string;
    /** Hide the copy button with copyable={false}. */
    copyable?: boolean;
    class?: string;
    style?: string;
  };
  let {
    code,
    html,
    filename,
    language,
    lineNumbers = false,
    highlight,
    copyLabel = "Copy code",
    copyable = true,
    class: className,
    style,
    ...rest
  }: Props = $props();

  let copied = $state(false);
  let status = $state("");
  let timer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => () => clearTimeout(timer));

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfEmpty = () => {
    if (isDev() && code == null && html == null) console.warn("VinUI CodeBlock: pass `code` or `html`.");
  };
  warnIfEmpty();

  const source = $derived((html ?? code ?? "").replace(/\n$/, ""));
  const plain = $derived(html != null ? textOf(source) : source);
  const byLine = $derived(lineNumbers || (highlight?.length ?? 0) > 0);
  const marks = $derived(new Set(highlight));
  const lines = $derived(byLine ? source.split("\n") : []);
  const header = $derived(filename != null || language != null);
  const gutter = $derived(lineNumbers && lines.length > 99 ? `${String(lines.length).length}ch` : undefined);

  async function onCopy() {
    const ok = await copyText(plain);
    clearTimeout(timer);
    copied = ok;
    status = ok ? "Copied" : "Couldn't copy";
    timer = setTimeout(() => {
      copied = false;
      status = "";
    }, 2000);
  }
</script>

{#snippet copyButton()}
  {#if copyable}
    <button
      type="button"
      class="vin-btn vin-btn--ghost vin-btn--icon vin-btn--sm vin-code-block__copy"
      aria-label={copyLabel}
      data-copied={copied ? "" : undefined}
      onclick={onCopy}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
        ><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg
      ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
        ><path d="M20 6 9 17l-5-5" /></svg
      >
    </button>
  {/if}
{/snippet}

<div
  {...rest}
  class={["vin-code-block", lineNumbers && "vin-code-block--numbered", className].filter(Boolean).join(" ")}
  style={gutter ? `--vin-code-gutter: ${gutter};${style ? ` ${style}` : ""}` : style}
>
  {#if header}
    <div class="vin-code-block__header">
      {#if filename != null}<span class="vin-code-block__title">{#if typeof filename === "function"}{@render filename()}{:else}{filename}{/if}</span>{/if}
      {#if language != null}<span class="vin-code-block__lang">{language}</span>{/if}
      {@render copyButton()}
    </div>
  {:else}
    {@render copyButton()}
  {/if}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (long lines scroll sideways, so keyboard users need to reach it) -->
  <pre class="vin-code-block__pre" tabindex="0">{#if byLine}<code
        >{#each lines as line, i (i)}{#if html != null}<span
              class={["vin-code-block__line", marks.has(i + 1) && "vin-code-block__line--highlight"].filter(Boolean).join(" ")}>{@html line}</span
            >{:else}<span class={["vin-code-block__line", marks.has(i + 1) && "vin-code-block__line--highlight"].filter(Boolean).join(" ")}>{line}</span
            >{/if}{/each}</code
      >{:else if html != null}<code>{@html source}</code>{:else}<code>{source}</code>{/if}</pre>
  {#if copyable}<span class="vin-code-block__status" role="status">{status}</span>{/if}
</div>
