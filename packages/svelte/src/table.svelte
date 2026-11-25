<!--
  VinUI · Table (Svelte). API: spec/table.json.
  Write the thead / tbody / tfoot yourself; Table adds the scrolling frame and the caption.
  Mark number cells with class="vin-table__num".
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLTableAttributes } from "svelte/elements";

  type Props = Omit<HTMLTableAttributes, "class"> & {
    /** Says what the table shows. Shown under the table. */
    caption?: string | Snippet;
    /** Name for the scrolling frame. Default: the caption, if it's text. */
    label?: string;
    striped?: boolean;
    class?: string;
    children?: Snippet;
  };
  let { caption, label, striped = false, class: className, style, children, ...rest }: Props = $props();

  const name = $derived(label ?? (typeof caption === "string" ? caption : undefined));
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (the frame scrolls, so keyboard users must be able to reach it) -->
<div class="vin-table-wrap" role="region" aria-label={name} tabindex="0" {style}>
  <table {...rest} class={["vin-table", striped && "vin-table--striped", className].filter(Boolean).join(" ")}>
    {#if caption != null}
      <caption class="vin-table__caption">{#if typeof caption === "function"}{@render caption()}{:else}{caption}{/if}</caption>
    {/if}
    {@render children?.()}
  </table>
</div>
