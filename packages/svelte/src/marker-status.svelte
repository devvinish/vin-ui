<!--
  VinUI · Status Marker (Svelte). Part of marker.svelte.
  What the assistant is doing ("Searching…", "Done", "Error"), inline in a reply.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, "class"> & {
    /** "running" shows a spinner, "done" a check, "error" a warning sign. Default: "running". */
    status?: "running" | "done" | "error";
    /** Announce changes to screen readers (role="status"). Default: true while running. */
    live?: boolean;
    class?: string;
    children?: Snippet;
  };
  let { status = "running", live, class: className, children, ...rest }: Props = $props();

  const isLive = $derived(live ?? status === "running");
</script>

{#snippet icon(paths: string[])}
  <svg class="vin-marker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    ><circle cx="12" cy="12" r="9" />{#each paths as d (d)}<path {d} />{/each}</svg
  >
{/snippet}

<span
  role={isLive ? "status" : undefined}
  {...rest}
  class={["vin-marker vin-marker--status", status === "done" && "vin-marker--success", status === "error" && "vin-marker--danger", className].filter(Boolean).join(" ")}
>
  {#if status === "running"}<span class="vin-spinner vin-spinner--sm" aria-hidden="true"></span>{/if}
  {#if status === "done"}{@render icon(["m8.5 12 2.5 2.5 4.5-5"])}{/if}
  {#if status === "error"}{@render icon(["M12 8v4.5", "M12 16h.01"])}{/if}
  {@render children?.()}
</span>
