<!-- VinUI · Avatar group (Svelte). Overlapping avatars with one name. Part of avatar.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** Name for the group, e.g. "Project members". */
    label?: string;
    class?: string;
    children?: Snippet;
  };
  let { label, class: className, children, ...rest }: Props = $props();
</script>

<div role="group" aria-label={label} {...rest} class={["vin-avatar-group", className].filter(Boolean).join(" ")}>{@render children?.()}</div>
