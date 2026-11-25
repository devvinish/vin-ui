<!--
  VinUI · Radio Group (Svelte). API: spec/radio-group.json.
  Native radios in a fieldset: arrow keys, forms and screen readers work with no extra code. bind:value works.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type RadioOption = string | { value: string; label: string | Snippet; description?: string | Snippet; disabled?: boolean };
</script>

<script lang="ts">
  import type { HTMLFieldsetAttributes } from "svelte/elements";

  type Props = Omit<HTMLFieldsetAttributes, "class" | "children"> & {
    /** The group's name, shown as the legend. */
    label: string | Snippet;
    options: RadioOption[];
    /** The chosen option. */
    value?: string;
    onValueChange?: (value: string) => void;
    /** Form field name. Generated if you leave it out. */
    name?: string;
    orientation?: "vertical" | "horizontal";
    /** "cards" draws each option as a bordered card. */
    variant?: "default" | "cards";
    /** Error message. Also marks the radios invalid. */
    error?: string | Snippet;
    class?: string;
  };
  let {
    label,
    options,
    value = $bindable(),
    onValueChange,
    name,
    orientation = "vertical",
    variant = "default",
    error,
    disabled,
    class: className,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const base = `vin-${uid}`;
  const groupName = $derived(name ?? base);
  const errorId = $derived(error ? `${base}-error` : undefined);
  const items = $derived(options.map((o) => (typeof o === "string" ? { value: o, label: o as string | Snippet, description: undefined, disabled: false } : o)));

  function choose(v: string) {
    value = v;
    onValueChange?.(v);
  }
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<fieldset
  {...rest}
  {disabled}
  aria-describedby={[rest["aria-describedby"], errorId].filter(Boolean).join(" ") || undefined}
  class={["vin-radio-group", orientation === "horizontal" && "vin-radio-group--horizontal", variant === "cards" && "vin-radio-group--cards", className]
    .filter(Boolean)
    .join(" ")}
>
  <legend class="vin-radio-group__legend">{@render text(label)}</legend>
  {#each items as o, i (o.value)}
    {@const id = `${base}-${i}`}
    {@const descId = o.description ? `${id}-desc` : undefined}
    <div class="vin-choice">
      <!-- svelte-ignore a11y_role_supports_aria_props_implicit (aria-invalid on each radio is what screen readers announce) -->
      <input
        type="radio"
        class="vin-radio"
        {id}
        name={groupName}
        value={o.value}
        checked={value === o.value}
        disabled={o.disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={descId}
        onchange={() => choose(o.value)}
      />
      <div class="vin-choice__body">
        <label class="vin-choice__label" for={id}>{@render text(o.label)}</label>
        {#if o.description}<p class="vin-choice__desc" id={descId}>{@render text(o.description)}</p>{/if}
      </div>
    </div>
  {/each}
  {#if error}<p class="vin-error" id={errorId}>{@render text(error)}</p>{/if}
</fieldset>
