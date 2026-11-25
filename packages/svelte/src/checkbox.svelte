<!--
  VinUI · Checkbox (Svelte). API: spec/checkbox.json.
  A real <input type="checkbox">. With `label`, it renders the label and description for you.
  bind:checked and bind:indeterminate work.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = Omit<HTMLInputAttributes, "class" | "type" | "checked" | "indeterminate"> & {
    checked?: boolean;
    /** Show the "some selected" dash. */
    indeterminate?: boolean;
    /** Visible label, linked to the checkbox. Without it, pass an aria-label. */
    label?: string | Snippet;
    /** Smaller text under the label, read out with the checkbox. */
    description?: string | Snippet;
    /** Put the checkbox after the text, full width. Default: "start". */
    controlPosition?: "start" | "end";
    class?: string;
  };
  let {
    checked = $bindable(false),
    indeterminate = $bindable(false),
    label,
    description,
    controlPosition = "start",
    id,
    class: className,
    style,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const inputId = $derived(id ?? `vin-${uid}`);
  const descId = $derived(description ? `${inputId}-desc` : undefined);

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !label && !rest["aria-label"] && !rest["aria-labelledby"]) console.warn("VinUI Checkbox: pass a label or an aria-label.");
  };
  warnIfUnnamed();
</script>

{#snippet text(value: string | Snippet)}{#if typeof value === "function"}{@render value()}{:else}{value}{/if}{/snippet}

{#if !label}
  <input {...rest} bind:checked bind:indeterminate {id} type="checkbox" class={["vin-checkbox", className].filter(Boolean).join(" ")} {style} />
{:else}
  <div class={["vin-choice", controlPosition === "end" && "vin-choice--end", className].filter(Boolean).join(" ")} {style}>
    <input
      {...rest}
      bind:checked
      bind:indeterminate
      id={inputId}
      type="checkbox"
      class="vin-checkbox"
      aria-describedby={[rest["aria-describedby"], descId].filter(Boolean).join(" ") || undefined}
    />
    <div class="vin-choice__body">
      <label class="vin-choice__label" for={inputId}>{@render text(label)}</label>
      {#if description}<p class="vin-choice__desc" id={descId}>{@render text(description)}</p>{/if}
    </div>
  </div>
{/if}
