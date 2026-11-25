<!-- VinUI · Tab panel (Svelte). Shown when its tab is open. Part of tabs.svelte. -->
<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Ctx = { readonly value: string; base: string };
  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & { value: string; class?: string; children?: Snippet };
  let { value, class: className, children, ...rest }: Props = $props();

  const tabs = getContext<Ctx | undefined>("vin-tabs");
  if (!tabs) throw new Error("VinUI: <TabPanel> must be inside <Tabs>.");
  const ctx = tabs;
  const safe = (v: string) => v.replace(/[^a-zA-Z0-9_-]/g, "-");
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (panels take focus so keyboard users reach their content after the tabs) -->
<div
  {...rest}
  role="tabpanel"
  id={`${ctx.base}-panel-${safe(value)}`}
  aria-labelledby={`${ctx.base}-tab-${safe(value)}`}
  tabindex="0"
  hidden={ctx.value !== value}
  class={["vin-tabs__panel", className].filter(Boolean).join(" ")}
>
  {@render children?.()}
</div>
