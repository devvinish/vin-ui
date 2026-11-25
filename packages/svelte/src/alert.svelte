<!--
  VinUI · Alert (Svelte). API: spec/alert.json.
  Each variant has a built-in icon. Pass onDismiss for a close button; focus then moves to the next control.
  A custom `icon` snippet should render an svg with class="vin-alert__icon".
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Variant = "neutral" | "primary" | "success" | "warning" | "danger";
  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class" | "title"> & {
    variant?: Variant;
    title?: string | Snippet;
    /** Your own icon (an svg with class="vin-alert__icon"), or false for none. Default: the variant's icon. */
    icon?: Snippet | false;
    /** Buttons under the text. */
    actions?: Snippet;
    /** Shows a close button. Remove the alert in this callback. */
    onDismiss?: () => void;
    /** The close button's name. Default: "Dismiss". */
    dismissLabel?: string;
    class?: string;
    children?: Snippet;
  };
  let { variant = "neutral", title, icon, actions, onDismiss, dismissLabel = "Dismiss", class: className, children, ...rest }: Props = $props();

  let box = $state<HTMLDivElement>();
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function dismiss() {
    if (box && box.contains(document.activeElement)) {
      // Focus the next control after the alert (or the one before it), so keyboard users stay in place.
      const all = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !box!.contains(el));
      const after = all.filter((el) => box!.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
      (after[0] ?? all[all.length - after.length - 1])?.focus();
    }
    onDismiss?.();
  }
</script>

<div bind:this={box} {...rest} class={["vin-alert", variant !== "neutral" && `vin-alert--${variant}`, className].filter(Boolean).join(" ")}>
  {#if icon}
    {@render icon()}
  {:else if icon !== false}
    <svg class="vin-alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      {#if variant === "success"}
        <circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" />
      {:else if variant === "warning"}
        <path d="M10.3 4.2 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" /><path d="M12 9.5v4" /><path d="M12 17h.01" />
      {:else if variant === "danger"}
        <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5" /><path d="M12 16h.01" />
      {:else}
        <circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" />
      {/if}
    </svg>
  {/if}
  <div class="vin-alert__content">
    {#if title != null}<p class="vin-alert__title">{#if typeof title === "function"}{@render title()}{:else}{title}{/if}</p>{/if}
    {#if children}<p class="vin-alert__description">{@render children()}</p>{/if}
    {#if actions}<div class="vin-alert__actions">{@render actions()}</div>{/if}
  </div>
  {#if onDismiss}
    <button type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-alert__close" aria-label={dismissLabel} onclick={dismiss}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    </button>
  {/if}
</div>
