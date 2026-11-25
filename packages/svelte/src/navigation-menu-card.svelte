<!-- VinUI · Navigation Menu card (Svelte). A link in a panel: a title and, as children, an optional line of text. Part of navigation-menu.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type Props = Omit<HTMLAnchorAttributes, "class" | "title"> & {
    title: string | Snippet;
    /** Marks the link to the current page. */
    active?: boolean;
    class?: string;
    children?: Snippet;
  };
  let { title, active = false, class: className, children, ...rest }: Props = $props();
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<li>
  <a aria-current={active ? "page" : undefined} {...rest} class={["vin-nav-menu__card", className].filter(Boolean).join(" ")}>
    <span class="vin-nav-menu__card-title">{@render text(title)}</span>
    {#if children}<span class="vin-nav-menu__card-text">{@render children()}</span>{/if}
  </a>
</li>
