<!--
  VinUI · Native Select (Svelte). API: spec/native-select.json.
  The browser's own <select>, drawn like an Input. With `label`, it renders the field for you. bind:value works.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLSelectAttributes } from "svelte/elements";

  type Props = Omit<HTMLSelectAttributes, "class" | "size"> & {
    size?: "sm" | "md" | "lg";
    /** Visible label. Without it, pass an aria-label. */
    label?: string | Snippet;
    hint?: string | Snippet;
    /** Error message. Also marks the select invalid. */
    error?: string | Snippet;
    class?: string;
    children?: Snippet;
  };
  let { size = "md", label, hint, error, id, class: className, style, value = $bindable(), children, ...rest }: Props = $props();

  const uid = $props.id();
  const selectId = $derived(id ?? `vin-${uid}`);
  const cls = $derived(["vin-input", "vin-native-select", size !== "md" && `vin-input--${size}`].filter(Boolean).join(" "));
  const hintId = $derived(hint ? `${selectId}-hint` : undefined);
  const errorId = $derived(error ? `${selectId}-error` : undefined);
</script>

{#snippet text(value: string | Snippet)}{#if typeof value === "function"}{@render value()}{:else}{value}{/if}{/snippet}

{#if !label}
  <select {...rest} bind:value {id} class={[cls, className].filter(Boolean).join(" ")} {style}>{@render children?.()}</select>
{:else}
  <div class={["vin-field", className].filter(Boolean).join(" ")} {style}>
    <label class="vin-label" for={selectId}>{@render text(label)}</label>
    <select
      {...rest}
      bind:value
      id={selectId}
      class={cls}
      aria-invalid={error ? true : rest["aria-invalid"]}
      aria-describedby={[rest["aria-describedby"], errorId, hintId].filter(Boolean).join(" ") || undefined}
    >
      {@render children?.()}
    </select>
    {#if error}<p class="vin-error" id={errorId}>{@render text(error)}</p>{/if}
    {#if hint}<p class="vin-hint" id={hintId}>{@render text(hint)}</p>{/if}
  </div>
{/if}
