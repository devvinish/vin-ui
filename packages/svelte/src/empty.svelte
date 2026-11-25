<!--
  VinUI · Empty (Svelte). API: spec/empty.json.
  What to show when there's nothing yet, with the next step.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class" | "title"> & {
    variant?: "default" | "outline";
    icon?: Snippet;
    title?: string | Snippet;
    /** Tag for the title. Use h2/h3 when it heads a section. Default: p. */
    titleAs?: string;
    description?: string | Snippet;
    actions?: Snippet;
    class?: string;
    children?: Snippet;
  };
  let { variant = "default", icon, title, titleAs = "p", description, actions, class: className, children, ...rest }: Props = $props();
</script>

{#snippet text(value: string | Snippet)}{#if typeof value === "function"}{@render value()}{:else}{value}{/if}{/snippet}

<div {...rest} class={["vin-empty", variant === "outline" && "vin-empty--outline", className].filter(Boolean).join(" ")}>
  {#if icon}<div class="vin-empty__media">{@render icon()}</div>{/if}
  {#if title != null}<svelte:element this={titleAs} class="vin-empty__title">{@render text(title)}</svelte:element>{/if}
  {#if description != null}<p class="vin-empty__description">{@render text(description)}</p>{/if}
  {@render children?.()}
  {#if actions}<div class="vin-empty__actions">{@render actions()}</div>{/if}
</div>
