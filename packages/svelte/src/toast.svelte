<!--
  VinUI · Toast (Svelte). API: spec/toast.json.
  Put <Toaster /> (toast-toaster.svelte) once in your app, then call toast({ title, description, variant, action })
  from anywhere. The timer pauses while the pointer or focus is on a toast.
  This file is one toast (<Toast>); you can also show one inline.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type ToastVariant = "default" | "success" | "danger";
  export type ToastOptions = {
    title: string | Snippet;
    description?: string | Snippet;
    variant?: ToastVariant;
    action?: { label: string; onClick: () => void };
    /** Milliseconds. Default 5000. */
    duration?: number;
  };
  export type ToastEntry = ToastOptions & { id: number; leaving?: boolean };

  export type ToastProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "title"> &
    Omit<ToastOptions, "duration"> & {
      onClose?: () => void;
      class?: string;
    };

  /** The toasts on screen. <Toaster> reads this. */
  export const toasts = $state<{ entries: ToastEntry[] }>({ entries: [] });
  let nextId = 0;

  /** Show a toast. Returns its id, for dismissToast(id). */
  export function toast(options: ToastOptions | string): number {
    const opts = typeof options === "string" ? { title: options } : options;
    const id = ++nextId;
    toasts.entries = [...toasts.entries, { ...opts, id }];
    return id;
  }

  /** Close a toast early. */
  export function dismissToast(id: number) {
    if (!toasts.entries.some((t) => t.id === id && !t.leaving)) return;
    toasts.entries = toasts.entries.map((t) => (t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => {
      toasts.entries = toasts.entries.filter((t) => t.id !== id);
    }, 160);
  }
</script>

<script lang="ts">
  let { title, description, variant = "default", action, onClose, class: className, ...rest }: ToastProps = $props();
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<div {...rest} class={["vin-toast", variant !== "default" && `vin-toast--${variant}`, className].filter(Boolean).join(" ")}>
  {#if variant === "success"}
    <svg class="vin-toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
      ><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg
    >
  {:else if variant === "danger"}
    <svg class="vin-toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
      ><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5" /><path d="M12 16h.01" /></svg
    >
  {/if}
  <div class="vin-toast__content">
    <p class="vin-toast__title">{@render text(title)}</p>
    {#if description != null}<p class="vin-toast__description">{@render text(description)}</p>{/if}
    {#if action}
      <div class="vin-toast__actions">
        <button type="button" class="vin-btn vin-btn--outline vin-btn--sm" onclick={action.onClick}>{action.label}</button>
      </div>
    {/if}
  </div>
  <button type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-toast__close" aria-label="Close" onclick={() => onClose?.()}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  </button>
</div>
