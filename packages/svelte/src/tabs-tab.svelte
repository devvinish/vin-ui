<!-- VinUI · Tab (Svelte). One tab in a <TabList>; `value` links it to its <TabPanel>. Part of tabs.svelte. -->
<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Ctx = { readonly value: string; base: string; select: (v: string) => void };
  type Props = Omit<HTMLButtonAttributes, "class" | "value" | "type"> & { value: string; class?: string; children?: Snippet };
  let { value, class: className, onclick, children, ...rest }: Props = $props();

  const tabs = getContext<Ctx | undefined>("vin-tabs");
  if (!tabs) throw new Error("VinUI: <Tab> must be inside <Tabs>.");
  const ctx = tabs;
  const safe = (v: string) => v.replace(/[^a-zA-Z0-9_-]/g, "-");
  const on = $derived(ctx.value === value);

  function click(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(e);
    if (!e.defaultPrevented) ctx.select(value);
  }
</script>

<button
  {...rest}
  type="button"
  role="tab"
  id={`${ctx.base}-tab-${safe(value)}`}
  aria-selected={on}
  aria-controls={`${ctx.base}-panel-${safe(value)}`}
  tabindex={on ? 0 : -1}
  class={["vin-tabs__tab", className].filter(Boolean).join(" ")}
  onclick={click}>{@render children?.()}</button
>
