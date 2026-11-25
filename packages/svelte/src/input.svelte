<!--
  VinUI · Input (Svelte). API: spec/input.json.
  Parts: input-label.svelte (Label) and input-field.svelte (Field: label, hint and error wired up for you).
  For a full Textarea (count, auto-grow), see textarea.svelte.
-->
<script lang="ts" module>
  export type InputSize = "sm" | "md" | "lg";

  /** The class list for an input. */
  export function inputClasses({ size = "md", className }: { size?: InputSize; className?: string } = {}): string {
    return ["vin-input", size !== "md" && `vin-input--${size}`, className].filter(Boolean).join(" ");
  }
</script>

<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = Omit<HTMLInputAttributes, "class" | "size"> & {
    /** Height and text size, matching the Button sizes. Default: "md". */
    size?: InputSize;
    class?: string;
  };
  let { size, class: className, value = $bindable(), ...rest }: Props = $props();

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !rest.id && !rest["aria-label"] && !rest["aria-labelledby"]) {
      console.warn("VinUI Input: give it an id with a matching <Label for>, an aria-label, or use <Field label>.");
    }
  };
  warnIfUnnamed();
</script>

<input {...rest} bind:value class={inputClasses({ size, className })} />
