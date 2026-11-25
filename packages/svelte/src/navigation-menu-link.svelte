<!-- VinUI · Navigation Menu link (Svelte). A top-level link with no panel. Part of navigation-menu.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type Props = Omit<HTMLAnchorAttributes, "class"> & {
    /** Marks the link to the current page. */
    active?: boolean;
    class?: string;
    children?: Snippet;
  };
  let { active = false, class: className, children, ...rest }: Props = $props();
</script>

<li class="vin-nav-menu__item">
  <a aria-current={active ? "page" : undefined} {...rest} class={["vin-nav-menu__link", className].filter(Boolean).join(" ")}>{@render children?.()}</a>
</li>
