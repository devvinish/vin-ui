<!-- VinUI · Card title (Svelte). Part of card.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLHeadingElement>, "class"> & {
    /** Heading level, so the title fits your page outline. Default: "h3". */
    as?: "h2" | "h3" | "h4" | "p";
    class?: string;
    children?: Snippet;
  };
  let { as = "h3", class: className, children, ...rest }: Props = $props();
</script>

<svelte:element this={as} {...rest} class={["vin-card__title", className].filter(Boolean).join(" ")}>{@render children?.()}</svelte:element>
