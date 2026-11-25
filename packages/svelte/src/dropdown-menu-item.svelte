<!-- VinUI · Dropdown Menu item (Svelte). Goes inside <DropdownMenu>. Part of dropdown-menu.svelte. -->
<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = Omit<HTMLButtonAttributes, "class" | "role"> & {
    /** Called when the item is chosen. Call event.preventDefault() to keep the menu open. */
    onSelect?: (event: MouseEvent) => void;
    icon?: Snippet;
    /** A keyboard shortcut shown at the end, e.g. "⌘B". */
    shortcut?: string;
    /** For an action that deletes. */
    danger?: boolean;
    class?: string;
    children?: Snippet;
  };
  let { onSelect, icon, shortcut, danger = false, class: className, onclick, children, ...rest }: Props = $props();

  const menu = getContext<{ close: () => void } | undefined>("vin-menu");

  function click(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(e);
    onSelect?.(e);
    if (!e.defaultPrevented) menu?.close();
  }
</script>

<button
  type="button"
  {...rest}
  role="menuitem"
  tabindex="-1"
  class={["vin-menu__item", danger && "vin-menu__item--danger", className].filter(Boolean).join(" ")}
  onclick={click}
>
  {@render icon?.()}{@render children?.()}
  {#if shortcut != null}<span class="vin-menu__shortcut" aria-hidden="true">{shortcut}</span>{/if}
</button>
