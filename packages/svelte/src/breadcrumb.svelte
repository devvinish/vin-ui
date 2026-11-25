<!--
  VinUI · Breadcrumb (Svelte). API: spec/breadcrumb.json.
  items: top first. The last one is this page and gets aria-current="page".
-->
<script lang="ts" module>
  export type BreadcrumbItem = { label: string; href?: string };
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class" | "children"> & {
    items: BreadcrumbItem[];
    separator?: "slash" | "chevron";
    class?: string;
  };
  let { items, separator = "slash", class: className, ...rest }: Props = $props();
</script>

<nav aria-label="Breadcrumb" {...rest} class={["vin-breadcrumb", separator === "chevron" && "vin-breadcrumb--chevron", className].filter(Boolean).join(" ")}>
  <ol class="vin-breadcrumb__list">
    {#each items as item, i (i)}
      <!-- Long names are cut with "…"; keep the full name in the title. -->
      {@const title = item.label.length > 22 ? item.label : undefined}
      <li class="vin-breadcrumb__item">
        {#if i === items.length - 1}
          <span class="vin-breadcrumb__page" aria-current="page" {title}>{item.label}</span>
        {:else}
          <a class="vin-breadcrumb__link" href={item.href} {title}>{item.label}</a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
