<!-- VinUI · Prose (Svelte). Styles the plain tags inside: Markdown or CMS output. Part of typography.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class"> & { as?: string; class?: string; children?: Snippet };
  let { as = "div", class: className, children, ...rest }: Props = $props();
</script>

<svelte:element this={as} {...rest} class={["vin-prose", className].filter(Boolean).join(" ")}>{@render children?.()}</svelte:element>
