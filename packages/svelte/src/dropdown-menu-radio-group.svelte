<!--
  VinUI · Dropdown Menu radio group (Svelte). A set of options where one is picked; the menu stays open.
  Put <DropdownMenuRadioItem> inside. bind:value works. Part of dropdown-menu.svelte.
-->
<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    value?: string;
    onValueChange?: (value: string) => void;
    /** Name for the group, read by screen readers. */
    label: string;
    class?: string;
    children?: Snippet;
  };
  let { value = $bindable(), onValueChange, label, class: className, children, ...rest }: Props = $props();

  setContext("vin-menu-radio", {
    get value() {
      return value;
    },
    set(v: string) {
      value = v;
      onValueChange?.(v);
    },
  });
</script>

<div {...rest} role="group" aria-label={label} class={className}>{@render children?.()}</div>
