<!--
  VinUI · Input Group (Svelte). API: spec/input-group.json.
  An input with text, icons or buttons attached (the `start` and `end` props: text or a snippet).
  With `label`, it renders the field for you. bind:value works.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = Omit<HTMLInputAttributes, "class" | "size"> & {
    /** Shown before the input: text, an icon or a small Button. */
    start?: string | Snippet;
    /** Shown after the input. */
    end?: string | Snippet;
    size?: "sm" | "md" | "lg";
    label?: string | Snippet;
    hint?: string | Snippet;
    /** Error message. Also marks the input invalid. */
    error?: string | Snippet;
    class?: string;
  };
  let { start, end, size = "md", label, hint, error, id, class: className, style, value = $bindable(), ...rest }: Props = $props();

  const uid = $props.id();
  const inputId = $derived(id ?? `vin-${uid}`);
  const hintId = $derived(hint ? `${inputId}-hint` : undefined);
  const errorId = $derived(error ? `${inputId}-error` : undefined);

  // Clicking the padding or an addon's text focuses the input (not when clicking a button).
  function onpointerdown(e: PointerEvent) {
    if (!(e.target as HTMLElement).closest("button, a, input")) {
      e.preventDefault();
      document.getElementById(inputId)?.focus();
    }
  }
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

{#snippet group()}
  <!-- svelte-ignore a11y_no_static_element_interactions (a pointer convenience; the input itself is the control) -->
  <div
    class={["vin-input", "vin-input-group", size !== "md" && `vin-input--${size}`, !label && className].filter(Boolean).join(" ")}
    style={label ? undefined : style}
    {onpointerdown}
  >
    {#if start !== undefined}<span class="vin-input-group__addon">{@render text(start)}</span>{/if}
    <input
      {...rest}
      bind:value
      id={inputId}
      class="vin-input-group__input"
      aria-invalid={error ? true : rest["aria-invalid"]}
      aria-describedby={[rest["aria-describedby"], errorId, hintId].filter(Boolean).join(" ") || undefined}
    />
    {#if end !== undefined}<span class="vin-input-group__addon">{@render text(end)}</span>{/if}
  </div>
{/snippet}

{#if !label}
  {@render group()}
{:else}
  <div class={["vin-field", className].filter(Boolean).join(" ")} {style}>
    <label class="vin-label" for={inputId}>{@render text(label)}</label>
    {@render group()}
    {#if error}<p class="vin-error" id={errorId}>{@render text(error)}</p>{/if}
    {#if hint}<p class="vin-hint" id={hintId}>{@render text(hint)}</p>{/if}
  </div>
{/if}
