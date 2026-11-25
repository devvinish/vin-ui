<!-- VinUI · Dropdown Menu radio item (Svelte). Goes inside <DropdownMenuRadioGroup>. Part of dropdown-menu.svelte. -->
<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = Omit<HTMLButtonAttributes, "class" | "role" | "value"> & { value: string; class?: string; children?: Snippet };
  let { value, class: className, onclick, children, ...rest }: Props = $props();

  const group = getContext<{ readonly value?: string; set: (v: string) => void } | undefined>("vin-menu-radio");

  function click(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(e);
    group?.set(value);
  }
</script>

<button
  type="button"
  {...rest}
  role="menuitemradio"
  aria-checked={group?.value === value}
  tabindex="-1"
  class={["vin-menu__item", className].filter(Boolean).join(" ")}
  onclick={click}>{@render children?.()}</button
>
