<!--
  VinUI · Toggle (Svelte). API: spec/toggle.json.
  A button that stays pressed: aria-pressed tells screen readers its state. bind:pressed works.
-->
<script lang="ts" module>
  export type ToggleVariant = "default" | "outline";
  export type ToggleSize = "sm" | "md" | "lg" | "icon";

  /** The class list for a toggle. */
  export function toggleClasses({ variant = "default", size = "md", className }: { variant?: ToggleVariant; size?: ToggleSize; className?: string } = {}) {
    return ["vin-toggle", variant === "outline" && "vin-toggle--outline", size !== "md" && `vin-toggle--${size}`, className].filter(Boolean).join(" ");
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = Omit<HTMLButtonAttributes, "class" | "type"> & {
    pressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    variant?: ToggleVariant;
    /** "icon" is square, for icon-only toggles (give them an aria-label). */
    size?: ToggleSize;
    class?: string;
    children?: Snippet;
  };
  let { pressed = $bindable(false), onPressedChange, variant, size, class: className, onclick, children, ...rest }: Props = $props();

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && size === "icon" && !rest["aria-label"] && !rest["aria-labelledby"]) console.warn("VinUI Toggle: icon-only toggles need an aria-label.");
  };
  warnIfUnnamed();

  function click(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(e);
    if (e.defaultPrevented) return;
    pressed = !pressed;
    onPressedChange?.(pressed);
  }
</script>

<button {...rest} type="button" aria-pressed={pressed} class={toggleClasses({ variant, size, className })} onclick={click}>{@render children?.()}</button>
