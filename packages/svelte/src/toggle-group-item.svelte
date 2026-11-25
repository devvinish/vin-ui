<!-- VinUI · Toggle Group item (Svelte). Goes inside <ToggleGroup>. Part of toggle-group.svelte. -->
<script lang="ts">
  import { getContext, onDestroy, type Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Group = {
    single: boolean;
    size?: "sm" | "md" | "lg" | "icon";
    isOn: (v: string) => boolean;
    isStop: (v: string) => boolean;
    toggle: (v: string) => void;
    register: (item: { value: string; disabled: () => boolean }) => () => void;
  };
  type Props = Omit<HTMLButtonAttributes, "class" | "value" | "type"> & { value: string; class?: string; children?: Snippet };
  let { value, class: className, onclick, disabled, children, ...rest }: Props = $props();

  const group = getContext<Group | undefined>("vin-toggle-group");
  if (!group) throw new Error("VinUI: <ToggleGroupItem> must be inside <ToggleGroup>.");
  const ctx = group;

  onDestroy(
    ctx.register({
      get value() {
        return value;
      },
      disabled: () => !!disabled,
    }),
  );

  const on = $derived(ctx.isOn(value));

  function click(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(e);
    if (!e.defaultPrevented) ctx.toggle(value);
  }
</script>

<button
  {...rest}
  type="button"
  {disabled}
  data-value={value}
  role={ctx.single ? "radio" : undefined}
  aria-checked={ctx.single ? on : undefined}
  aria-pressed={ctx.single ? undefined : on}
  tabindex={ctx.isStop(value) ? 0 : -1}
  class={["vin-toggle", ctx.size && ctx.size !== "md" && `vin-toggle--${ctx.size}`, className].filter(Boolean).join(" ")}
  onclick={click}>{@render children?.()}</button
>
