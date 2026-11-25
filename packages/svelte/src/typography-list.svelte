<!-- VinUI · List (Svelte). A bulleted list, or numbered with `ordered`. Part of typography.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLUListElement | HTMLOListElement>, "class"> & { ordered?: boolean; class?: string; children?: Snippet };
  let { ordered = false, class: className, children, ...rest }: Props = $props();
</script>

<svelte:element this={ordered ? "ol" : "ul"} {...rest} class={["vin-list", className].filter(Boolean).join(" ")}>{@render children?.()}</svelte:element>
