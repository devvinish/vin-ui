<!--
  VinUI · Dropdown Menu checkbox item (Svelte). An option that turns on and off; the menu stays open.
  bind:checked works. Part of dropdown-menu.svelte.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = Omit<HTMLButtonAttributes, "class" | "role"> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    class?: string;
    children?: Snippet;
  };
  let { checked = $bindable(false), onCheckedChange, class: className, onclick, children, ...rest }: Props = $props();

  function click(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(e);
    checked = !checked;
    onCheckedChange?.(checked);
  }
</script>

<button
  type="button"
  {...rest}
  role="menuitemcheckbox"
  aria-checked={checked}
  tabindex="-1"
  class={["vin-menu__item", className].filter(Boolean).join(" ")}
  onclick={click}>{@render children?.()}</button
>
