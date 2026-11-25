<!--
  VinUI · Switch (Svelte). API: spec/switch.json.
  A real checkbox with role="switch": works in forms, no extra state needed. bind:checked works.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = Omit<HTMLInputAttributes, "class" | "type" | "size" | "role" | "checked"> & {
    checked?: boolean;
    /** Visible label, linked to the switch. Without it, pass an aria-label. */
    label?: string | Snippet;
    /** Smaller text under the label, read out with the switch. */
    description?: string | Snippet;
    size?: "sm" | "md";
    /** Put the switch after the text, full width (settings rows). Default: "start". */
    controlPosition?: "start" | "end";
    class?: string;
  };
  let { checked = $bindable(false), label, description, size = "md", controlPosition = "start", id, class: className, style, ...rest }: Props = $props();

  const uid = $props.id();
  const inputId = $derived(id ?? `vin-${uid}`);
  const descId = $derived(description ? `${inputId}-desc` : undefined);
  const cls = $derived(["vin-switch", size === "sm" && "vin-switch--sm"].filter(Boolean).join(" "));

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !label && !rest["aria-label"] && !rest["aria-labelledby"]) console.warn("VinUI Switch: pass a label or an aria-label.");
  };
  warnIfUnnamed();
</script>

{#snippet text(value: string | Snippet)}{#if typeof value === "function"}{@render value()}{:else}{value}{/if}{/snippet}

{#if !label}
  <input {...rest} bind:checked {id} type="checkbox" role="switch" class={[cls, className].filter(Boolean).join(" ")} {style} />
{:else}
  <div class={["vin-choice", controlPosition === "end" && "vin-choice--end", className].filter(Boolean).join(" ")} {style}>
    <input
      {...rest}
      bind:checked
      id={inputId}
      type="checkbox"
      role="switch"
      class={cls}
      aria-describedby={[rest["aria-describedby"], descId].filter(Boolean).join(" ") || undefined}
    />
    <div class="vin-choice__body">
      <label class="vin-choice__label" for={inputId}>{@render text(label)}</label>
      {#if description}<p class="vin-choice__desc" id={descId}>{@render text(description)}</p>{/if}
    </div>
  </div>
{/if}
