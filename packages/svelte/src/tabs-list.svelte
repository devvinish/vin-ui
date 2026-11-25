<!-- VinUI · Tab list (Svelte). The row of tabs. Give it an aria-label that names the group. Part of tabs.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, onkeydown, children, ...rest }: Omit<HTMLAttributes<HTMLDivElement>, "class"> & { class?: string; children?: Snippet } = $props();

  function onKey(e: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onkeydown?.(e);
    const tabs = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')];
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    const target = step
      ? tabs[(i + step + tabs.length) % tabs.length]
      : e.key === "Home"
        ? tabs[0]
        : e.key === "End"
          ? tabs[tabs.length - 1]
          : null;
    if (target) {
      e.preventDefault();
      target.focus();
      target.click();
    }
  }
</script>

<!-- svelte-ignore a11y_interactive_supports_focus (the tabs inside take focus; the list only handles their arrow keys) -->
<div {...rest} role="tablist" class={["vin-tabs__list", className].filter(Boolean).join(" ")} onkeydown={onKey}>{@render children?.()}</div>
