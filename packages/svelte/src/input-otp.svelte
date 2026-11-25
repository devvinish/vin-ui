<!--
  VinUI · Input OTP (Svelte). API: spec/input-otp.json.
  One real <input autocomplete="one-time-code">, drawn as separate boxes. Paste, SMS autofill,
  password managers and screen readers all see a normal text field. bind:value works.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = Omit<HTMLInputAttributes, "class" | "value" | "size" | "maxlength" | "type"> & {
    /** Number of characters. Default: 6. */
    length?: number;
    /** Split the boxes into groups, e.g. [3, 3]. Default: one group. */
    groups?: number[];
    value?: string;
    onValueChange?: (value: string) => void;
    /** Called once every box is filled. */
    onComplete?: (value: string) => void;
    /** "numeric" (default) or "alphanumeric". */
    charset?: "numeric" | "alphanumeric";
    label?: string | Snippet;
    hint?: string | Snippet;
    error?: string | Snippet;
    class?: string;
  };
  let {
    length = 6,
    groups,
    value = $bindable(""),
    onValueChange,
    onComplete,
    charset = "numeric",
    label,
    hint,
    error,
    id,
    class: className,
    style,
    onfocus,
    onblur,
    onclick,
    onkeyup,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const inputId = $derived(id ?? `vin-${uid}`);
  let focused = $state(false);
  const current = $derived((value ?? "").slice(0, length));
  const hintId = $derived(hint ? `${inputId}-hint` : undefined);
  const errorId = $derived(error ? `${inputId}-error` : undefined);
  // Slot indexes, group by group: [[0, 1, 2], [3, 4, 5]].
  const slots = $derived.by(() => {
    let n = 0;
    return (groups ?? [length]).map((count) => Array.from({ length: count }, () => n++));
  });

  const atEnd = (el: HTMLInputElement) => requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));

  function oninput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    const re = charset === "numeric" ? /\D/g : /[^a-z0-9]/gi;
    const next = e.currentTarget.value.replace(re, "").slice(0, length);
    const was = current;
    e.currentTarget.value = next;
    value = next;
    onValueChange?.(next);
    if (next.length === length && was.length !== length) onComplete?.(next);
  }
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

{#snippet control()}
  <div class={["vin-otp", !label && className].filter(Boolean).join(" ")} style={label ? undefined : style}>
    <input
      {...rest}
      id={inputId}
      class="vin-otp__input"
      type="text"
      inputmode={charset === "numeric" ? "numeric" : "text"}
      autocomplete="one-time-code"
      pattern={charset === "numeric" ? "[0-9]*" : "[A-Za-z0-9]*"}
      maxlength={length}
      value={current}
      {oninput}
      onfocus={(e) => {
        focused = true;
        atEnd(e.currentTarget);
        onfocus?.(e);
      }}
      onblur={(e) => {
        focused = false;
        onblur?.(e);
      }}
      onclick={(e) => {
        atEnd(e.currentTarget);
        onclick?.(e);
      }}
      onkeyup={(e) => {
        atEnd(e.currentTarget);
        onkeyup?.(e);
      }}
      aria-invalid={error ? true : rest["aria-invalid"]}
      aria-describedby={[rest["aria-describedby"], errorId, hintId].filter(Boolean).join(" ") || undefined}
    />
    <div class="vin-otp__slots" aria-hidden="true">
      {#each slots as group, g (g)}
        {#if g > 0}<span class="vin-otp__sep"></span>{/if}
        {#each group as i (i)}
          <span class="vin-input vin-otp__slot" data-active={focused && i === Math.min(current.length, length - 1) ? "" : undefined}>{current[i] ?? ""}</span>
        {/each}
      {/each}
    </div>
  </div>
{/snippet}

{#if !label}
  {@render control()}
{:else}
  <div class={["vin-field", className].filter(Boolean).join(" ")} {style}>
    <label class="vin-label" for={inputId}>{@render text(label)}</label>
    {@render control()}
    {#if error}<p class="vin-error" id={errorId}>{@render text(error)}</p>{/if}
    {#if hint}<p class="vin-hint" id={hintId}>{@render text(hint)}</p>{/if}
  </div>
{/if}
