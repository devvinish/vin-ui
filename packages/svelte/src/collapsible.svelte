<!--
  VinUI · Collapsible (Svelte). API: spec/collapsible.json.
  A native <details>: one section behind a small button. bind:open works.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes, HTMLDetailsAttributes } from "svelte/elements";

  type Props = Omit<HTMLDetailsAttributes, "class" | "open"> & {
    trigger: string | Snippet;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Props for the content wrapper (class, style). */
    contentProps?: Omit<HTMLAttributes<HTMLDivElement>, "class"> & { class?: string };
    class?: string;
    children?: Snippet;
  };
  let { trigger, open = $bindable(false), onOpenChange, contentProps, class: className, ontoggle, children, ...rest }: Props = $props();

  function toggle(e: ToggleEvent & { currentTarget: EventTarget & HTMLDetailsElement }) {
    ontoggle?.(e);
    const now = e.currentTarget.open;
    if (now === open) return;
    open = now;
    onOpenChange?.(now);
  }
</script>

<details {...rest} class={["vin-collapsible", className].filter(Boolean).join(" ")} {open} ontoggle={toggle}>
  <summary class="vin-collapsible__trigger">{#if typeof trigger === "function"}{@render trigger()}{:else}{trigger}{/if}</summary>
  <div {...contentProps} class={["vin-collapsible__content", contentProps?.class].filter(Boolean).join(" ")}>{@render children?.()}</div>
</details>
