<!--
  VinUI · Pagination (Svelte). API: spec/pagination.json.
  With href, pages are links (good for SEO and new tabs). Without it, they're buttons and onPageChange is called.
-->
<script lang="ts" module>
  /** Pages to show: first, last, and `siblings` either side of `page`, with "…" for gaps. */
  export function pageRange(page: number, count: number, siblings = 1): (number | "…")[] {
    if (count <= 1) return [1];
    const start = Math.max(2, page - siblings);
    const end = Math.min(count - 1, page + siblings);
    const out: (number | "…")[] = [1];
    // A gap of one page shows that page instead of "…".
    if (start === 3) out.push(2);
    else if (start > 3) out.push("…");
    for (let p = start; p <= end; p++) out.push(p);
    if (end === count - 2) out.push(count - 1);
    else if (end < count - 2) out.push("…");
    out.push(count);
    return out;
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class" | "children"> & {
    page: number;
    count: number;
    href?: (page: number) => string;
    onPageChange?: (page: number) => void;
    siblings?: number;
    /** "Previous" and "Next" as words. */
    labels?: boolean;
    /** Previous, "Page 2 of 10", Next. */
    simple?: boolean;
    class?: string;
  };
  let { page, count, href, onPageChange, siblings = 1, labels = false, simple = false, class: className, ...rest }: Props = $props();

  const edge = $derived(simple ? "vin-btn vin-btn--outline vin-btn--sm" : labels ? "vin-btn vin-btn--ghost" : "vin-btn vin-btn--ghost vin-btn--icon");
  const worded = $derived(simple || labels);
</script>

{#snippet left()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>{/snippet}
{#snippet right()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>{/snippet}

{#snippet prevContent()}{@render left()}{#if worded}&#32;Previous{/if}{/snippet}
{#snippet nextContent()}{#if worded}Next&#32;{/if}{@render right()}{/snippet}

<!-- One page control: a link (or a disabled link) with href, otherwise a button. -->
{#snippet go(p: number, cls: string, content: string | number | Snippet, extra: Record<string, string | undefined> = {})}
  {@const disabled = p < 1 || p > count}
  {#if href}
    {#if disabled}
      <a class={cls} role="link" aria-disabled="true" {...extra}>{#if typeof content === "function"}{@render content()}{:else}{content}{/if}</a>
    {:else}
      <a class={cls} href={href(p)} {...extra}>{#if typeof content === "function"}{@render content()}{:else}{content}{/if}</a>
    {/if}
  {:else}
    <button type="button" class={cls} {disabled} onclick={() => onPageChange?.(p)} {...extra}>{#if typeof content === "function"}{@render content()}{:else}{content}{/if}</button>
  {/if}
{/snippet}

<nav aria-label="Pagination" {...rest} class={["vin-pagination", className].filter(Boolean).join(" ")}>
  <ul class="vin-pagination__list">
    <li>{@render go(page - 1, edge, prevContent, worded ? {} : { "aria-label": "Previous page" })}</li>
    {#if simple}
      <li><span class="vin-pagination__status">Page {page} of {count}</span></li>
    {:else}
      {#each pageRange(page, count, siblings) as p, i (i)}
        <li>
          {#if p === "…"}
            <span class="vin-pagination__ellipsis" aria-hidden="true">…</span>
          {:else if p === page}
            {@render go(p, "vin-btn vin-btn--outline vin-pagination__page", p, { "aria-current": "page" })}
          {:else}
            {@render go(p, "vin-btn vin-btn--ghost vin-pagination__page", p)}
          {/if}
        </li>
      {/each}
    {/if}
    <li>{@render go(page + 1, edge, nextContent, worded ? {} : { "aria-label": "Next page" })}</li>
  </ul>
</nav>
