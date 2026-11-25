<!--
  VinUI · Heading (Svelte). Part of typography.svelte.
  `level` sets the look; `as` sets the tag (default h1–h4 to match), so headings can follow your page outline.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLHeadingElement>, "class"> & {
    /** The size: 1 is the largest. Default 2. */
    level?: 1 | 2 | 3 | 4;
    as?: string;
    class?: string;
    children?: Snippet;
  };
  let { level = 2, as, class: className, children, ...rest }: Props = $props();
</script>

<svelte:element this={as ?? `h${level}`} {...rest} class={[`vin-h${level}`, className].filter(Boolean).join(" ")}>{@render children?.()}</svelte:element>
