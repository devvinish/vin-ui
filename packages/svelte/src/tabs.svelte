<!--
  VinUI · Tabs (Svelte). API: spec/tabs.json.
  WAI-ARIA tabs: arrow keys move between tabs, Home/End jump, panels are linked by id.
  Parts: tabs-list.svelte (TabList), tabs-tab.svelte (Tab), tabs-panel.svelte (TabPanel). bind:value works.
-->
<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** The open tab. */
    value?: string;
    onValueChange?: (value: string) => void;
    /** "segmented" (default) or "line" (underline). */
    variant?: "segmented" | "line";
    class?: string;
    children?: Snippet;
  };
  let { value = $bindable(""), onValueChange, variant = "segmented", class: className, children, ...rest }: Props = $props();

  const uid = $props.id();

  setContext("vin-tabs", {
    get value() {
      return value;
    },
    base: `vin-${uid}`,
    select(v: string) {
      value = v;
      onValueChange?.(v);
    },
  });
</script>

<div {...rest} class={["vin-tabs", variant === "line" && "vin-tabs--line", className].filter(Boolean).join(" ")}>{@render children?.()}</div>
