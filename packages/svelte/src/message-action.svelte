<!-- VinUI · Message Action (Svelte). A small icon button for a message's actions row; put an SVG inside. Part of message.svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = Omit<HTMLButtonAttributes, "class" | "aria-label"> & {
    /** What the button does. Screen readers read it; the button only shows an icon. */
    label: string;
    /** For toggles: pressed or not (sets aria-pressed). */
    pressed?: boolean;
    class?: string;
    children?: Snippet;
  };
  let { label, pressed, type = "button", class: className, children, ...rest }: Props = $props();

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !label) console.warn("VinUI MessageAction: give it a label so screen readers can name it.");
  };
  warnIfUnnamed();
</script>

<button {...rest} {type} aria-label={label} aria-pressed={pressed} class={["vin-btn vin-btn--ghost vin-btn--icon", className].filter(Boolean).join(" ")}>
  {@render children?.()}
</button>
