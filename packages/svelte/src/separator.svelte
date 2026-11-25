<!--
  VinUI · Separator (Svelte). API: spec/separator.json.
  An <hr> (a separator to screen readers), a hidden decorative line, or a line with a word in the middle.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    orientation?: "horizontal" | "vertical";
    /** Only visual: hidden from screen readers. */
    decorative?: boolean;
    /** A word in the middle of the line, like "or". */
    label?: string | Snippet;
    class?: string;
  };
  let { orientation = "horizontal", decorative = false, label, class: className, ...rest }: Props = $props();

  const classes = $derived(
    ["vin-separator", orientation === "vertical" && "vin-separator--vertical", label != null && "vin-separator--label", className]
      .filter(Boolean)
      .join(" "),
  );
</script>

{#if label != null}
  <div {...rest} class={classes}>{#if typeof label === "function"}{@render label()}{:else}{label}{/if}</div>
{:else if decorative}
  <div aria-hidden="true" {...rest} class={classes}></div>
{:else}
  <hr aria-orientation={orientation === "vertical" ? "vertical" : undefined} {...rest} class={classes} />
{/if}
