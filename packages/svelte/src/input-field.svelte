<!--
  VinUI · Field (Svelte). A labelled input with optional hint and error. Part of input.svelte.
  `class` and `style` go on the wrapper; every other prop goes to the input. Bind the text with bind:value.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = Omit<HTMLInputAttributes, "class" | "size"> & {
    /** Visible label, linked to the input. */
    label: string | Snippet;
    /** Help text under the input. */
    hint?: string | Snippet;
    /** Error message. Also marks the input invalid. */
    error?: string | Snippet;
    /** Render a textarea instead of an input. */
    multiline?: boolean;
    rows?: number;
    size?: "sm" | "md" | "lg";
    class?: string;
  };
  let { label, hint, error, multiline = false, rows, id, class: className, style, size = "md", value = $bindable(), ...rest }: Props = $props();

  const uid = $props.id();
  const inputId = $derived(id ?? `vin-${uid}`);
  const hintId = $derived(hint ? `${inputId}-hint` : undefined);
  const errorId = $derived(error ? `${inputId}-error` : undefined);
  const describedBy = $derived([rest["aria-describedby"], errorId, hintId].filter(Boolean).join(" ") || undefined);
  const invalid = $derived(error ? true : rest["aria-invalid"]);
</script>

{#snippet text(value: string | Snippet)}{#if typeof value === "function"}{@render value()}{:else}{value}{/if}{/snippet}

<div class={["vin-field", className].filter(Boolean).join(" ")} {style}>
  <label class="vin-label" for={inputId}>{@render text(label)}</label>
  {#if multiline}
    <textarea
      {...rest as Record<string, unknown>}
      bind:value
      id={inputId}
      {rows}
      class="vin-input"
      aria-describedby={describedBy}
      aria-invalid={invalid}
    ></textarea>
  {:else}
    <input
      {...rest}
      bind:value
      id={inputId}
      class={["vin-input", size !== "md" && `vin-input--${size}`].filter(Boolean).join(" ")}
      aria-describedby={describedBy}
      aria-invalid={invalid}
    />
  {/if}
  {#if error}<p class="vin-error" id={errorId}>{@render text(error)}</p>{/if}
  {#if hint}<p class="vin-hint" id={hintId}>{@render text(hint)}</p>{/if}
</div>
