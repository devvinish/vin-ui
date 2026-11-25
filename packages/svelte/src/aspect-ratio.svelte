<!--
  VinUI · Aspect Ratio (Svelte). API: spec/aspect-ratio.json.
  <AspectRatio ratio={16 / 9}><img … /></AspectRatio>
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** Width ÷ height: 16 / 9, 4 / 3, 1 … or a CSS string like "16 / 9". Default 16 / 9. */
    ratio?: number | string;
    class?: string;
    children?: Snippet;
  };
  let { ratio = "16 / 9", class: className, style, children, ...rest }: Props = $props();
</script>

<div {...rest} class={["vin-aspect", className].filter(Boolean).join(" ")} style={[`--vin-ratio: ${ratio}`, style].filter(Boolean).join("; ")}>
  {@render children?.()}
</div>
