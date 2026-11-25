<!--
  VinUI · Trace Step (Svelte). Goes inside <Trace>. Part of trace.svelte.
  With children, the details sit behind a native <details>; bind:open works.
-->
<script lang="ts" module>
  export type TraceStatus = "done" | "running" | "error" | "pending";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLLiAttributes } from "svelte/elements";

  const STATUS_LABEL: Record<TraceStatus, string> = { done: "Done", running: "Running", error: "Failed", pending: "Not started" };

  type Props = Omit<HTMLLiAttributes, "class" | "title"> & {
    /** Default: "done". */
    status?: TraceStatus;
    /** What happened, e.g. "Searched the web". */
    title: string | Snippet;
    /** The kind of step, e.g. "Tool call", "Thought" or "Result". */
    kind?: string;
    /** How long it took, e.g. "1.2s". */
    duration?: string;
    /** Your own text instead of kind and duration. */
    meta?: string | Snippet;
    /** What screen readers hear for the status. Default: Done, Running, Failed or Not started. */
    statusLabel?: string;
    /** With details (children): open or closed. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    class?: string;
    /** Details: the input, output or error. Put code in <pre class="vin-trace__code">. */
    children?: Snippet;
  };
  let {
    status = "done",
    title,
    kind,
    duration,
    meta,
    statusLabel,
    open = $bindable(false),
    onOpenChange,
    class: className,
    children,
    ...rest
  }: Props = $props();

  const line = $derived(meta ?? ([kind, duration].filter(Boolean).join(" · ") || null));

  function toggle(e: Event & { currentTarget: EventTarget & HTMLDetailsElement }) {
    const now = e.currentTarget.open;
    if (now === open) return;
    open = now;
    onOpenChange?.(now);
  }
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

{#snippet head()}
  <span class="vin-trace__title">{@render text(title)}</span>
  {#if line != null}<span class="vin-trace__meta">{@render text(line)}</span>{/if}
{/snippet}

<li {...rest} class={["vin-trace__step", status !== "done" && `vin-trace__step--${status}`, className].filter(Boolean).join(" ")}>
  <span class="vin-trace__icon" role="img" aria-label={statusLabel ?? STATUS_LABEL[status]}>
    {#if status === "done"}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
    {:else if status === "error"}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 7 7 17" /><path d="m7 7 10 10" /></svg>
    {:else if status === "running"}
      <span class="vin-spinner vin-spinner--sm" aria-hidden="true"></span>
    {/if}
  </span>
  {#if !children}
    <div class="vin-trace__head">{@render head()}</div>
  {:else}
    <details class="vin-collapsible vin-trace__details" {open} ontoggle={toggle}>
      <summary class="vin-collapsible__trigger vin-trace__head">{@render head()}</summary>
      <div class="vin-collapsible__content vin-trace__body">{@render children()}</div>
    </details>
  {/if}
</li>
