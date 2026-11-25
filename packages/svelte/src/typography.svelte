<!--
  VinUI · Typography (Svelte). API: spec/typography.json.
  This file is <Text>: a paragraph in one of four looks. The look (variant) and the tag (as) are separate.
  Parts: typography-heading, typography-blockquote, typography-list, typography-code, typography-link, typography-prose.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    variant?: "p" | "lead" | "muted" | "small";
    /** The tag. Default: p. */
    as?: string;
    class?: string;
    children?: Snippet;
  };
  let { variant = "p", as = "p", class: className, children, ...rest }: Props = $props();
</script>

<svelte:element this={as} {...rest} class={[`vin-${variant}`, className].filter(Boolean).join(" ")}>{@render children?.()}</svelte:element>
