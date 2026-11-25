<!--
  VinUI · Accordion (Svelte). API: spec/accordion.json.
  Native <details>: the browser handles keyboard and find-in-page. type="single" keeps one open (same name on every item).
  bind:value works (the open items' values).
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type AccordionItem = { value: string; title: string | Snippet; content: string | Snippet };
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    items: AccordionItem[];
    type?: "single" | "multiple";
    /** Open items. */
    value?: string[];
    onValueChange?: (value: string[]) => void;
    variant?: "default" | "outline";
    class?: string;
  };
  let { items, type = "single", value = $bindable([]), onValueChange, variant = "default", class: className, ...rest }: Props = $props();

  const uid = $props.id();
  const name = `vin-acc-${uid}`;

  function set(next: string[]) {
    value = next;
    onValueChange?.(next);
  }
  function ontoggle(v: string, e: Event) {
    const isOpen = (e.currentTarget as HTMLDetailsElement).open;
    const cur = value ?? [];
    if (isOpen && !cur.includes(v)) set(type === "single" ? [v] : [...cur, v]);
    if (!isOpen && cur.includes(v)) set(cur.filter((x) => x !== v));
  }
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<div {...rest} class={["vin-accordion", variant === "outline" && "vin-accordion--outline", className].filter(Boolean).join(" ")}>
  {#each items as item (item.value)}
    <details class="vin-accordion__item" name={type === "single" ? name : undefined} open={(value ?? []).includes(item.value)} ontoggle={(e) => ontoggle(item.value, e)}>
      <summary class="vin-accordion__trigger">{@render text(item.title)}</summary>
      <div class="vin-accordion__content">{@render text(item.content)}</div>
    </details>
  {/each}
</div>
