<!-- VinUI · Navigation Menu grid (Svelte). The list of cards in a panel. Part of navigation-menu.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLUListElement>, "class"> & {
    /** One column of links instead of two. */
    list?: boolean;
    class?: string;
    children?: Snippet;
  };
  let { list = false, class: className, children, ...rest }: Props = $props();
</script>

<ul {...rest} class={["vin-nav-menu__grid", list && "vin-nav-menu__grid--list", className].filter(Boolean).join(" ")}>{@render children?.()}</ul>
