<!--
  VinUI · Textarea (Svelte). API: spec/textarea.json.
  Multi-line text with label, hint, error, a character count (from maxlength) and optional auto-grow. bind:value works.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  type Props = Omit<HTMLTextareaAttributes, "class" | "value"> & {
    value?: string;
    /** Visible label. Without it, pass an aria-label. */
    label?: string | Snippet;
    hint?: string | Snippet;
    /** Error message. Also marks the textarea invalid. */
    error?: string | Snippet;
    /** Grow with the content instead of scrolling (up to 260px, then it scrolls). */
    autoResize?: boolean;
    /** Show "12 / 280" under the field. On by default when maxlength is set. */
    showCount?: boolean;
    class?: string;
  };
  let {
    value = $bindable(""),
    label,
    hint,
    error,
    autoResize = false,
    showCount,
    id,
    class: className,
    style,
    oninput,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const taId = $derived(id ?? `vin-${uid}`);
  let el = $state<HTMLTextAreaElement>();
  const max = $derived(rest.maxlength ?? undefined);
  const counted = $derived((showCount ?? max != null) && max != null);
  const length = $derived((value ?? "").length);

  const canFieldSize = () => typeof CSS !== "undefined" && !!CSS.supports?.("field-sizing", "content");
  function grow() {
    if (!autoResize || !el || canFieldSize()) return;
    el.style.height = "auto";
    const cs = getComputedStyle(el);
    el.style.height = `${el.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)}px`;
  }
  // Grow when the text changes, typed or set from outside.
  $effect(() => {
    void value;
    grow();
  });

  const hintId = $derived(hint ? `${taId}-hint` : undefined);
  const errorId = $derived(error ? `${taId}-error` : undefined);
  const countId = $derived(counted ? `${taId}-count` : undefined);
  const cls = $derived(["vin-input", "vin-textarea", autoResize && "vin-textarea--auto"].filter(Boolean).join(" "));
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

{#if !label}
  <textarea {...rest} bind:this={el} bind:value {id} class={[cls, className].filter(Boolean).join(" ")} {style} {oninput}></textarea>
{:else}
  <div class={["vin-field", className].filter(Boolean).join(" ")} {style}>
    <label class="vin-label" for={taId}>{@render text(label)}</label>
    <textarea
      {...rest}
      bind:this={el}
      bind:value
      id={taId}
      class={cls}
      {oninput}
      aria-invalid={error ? true : rest["aria-invalid"]}
      aria-describedby={[rest["aria-describedby"], errorId, hintId, countId].filter(Boolean).join(" ") || undefined}
    ></textarea>
    {#if error}<p class="vin-error" id={errorId}>{@render text(error)}</p>{/if}
    {#if hint || counted}
      <div class="vin-textarea__foot">
        {#if hint}<p class="vin-hint" id={hintId}>{@render text(hint)}</p>{/if}
        {#if counted}<p class="vin-textarea__count" id={countId} data-over={length >= Number(max) ? "" : undefined}>{length} / {max}</p>{/if}
      </div>
    {/if}
  </div>
{/if}
