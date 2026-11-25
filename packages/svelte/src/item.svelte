<!--
  VinUI · Item (Svelte). API: spec/item.json.
  A row: media, title and description, actions. Pass href to make the whole row a link.
  Inside <ItemGroup> (item-group.svelte) each item is a list item for screen readers.
-->
<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class" | "title"> & {
    variant?: "default" | "outline" | "muted";
    media?: Snippet;
    title?: string | Snippet;
    description?: string | Snippet;
    actions?: Snippet;
    /** Makes the whole row a link. Don't put buttons in actions then. */
    href?: string;
    class?: string;
    children?: Snippet;
  };
  let { variant = "default", media, title, description, actions, href, class: className, children, role, ...rest }: Props = $props();

  const inGroup = getContext<boolean>("vin-item-group") ?? false;
</script>

{#snippet text(value: string | Snippet)}{#if typeof value === "function"}{@render value()}{:else}{value}{/if}{/snippet}

<svelte:element
  this={href ? "a" : "div"}
  {...rest}
  {href}
  role={role ?? (inGroup ? "listitem" : undefined)}
  class={["vin-item", variant !== "default" && `vin-item--${variant}`, className].filter(Boolean).join(" ")}
>
  {#if media}<div class="vin-item__media">{@render media()}</div>{/if}
  <div class="vin-item__content">
    {#if title != null}<p class="vin-item__title">{@render text(title)}</p>{/if}
    {#if description != null}<p class="vin-item__description">{@render text(description)}</p>{/if}
    {@render children?.()}
  </div>
  {#if actions}<div class="vin-item__actions">{@render actions()}</div>{/if}
</svelte:element>
