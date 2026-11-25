<!--
  VinUI · Button (Svelte)
  API: spec/button.json. Styling comes from @vinui/styles (the vin-btn classes),
  so this file is the same for all 8 styles.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

  export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
  export type ButtonSize = "sm" | "md" | "lg" | "icon";

  type Base = {
    /** Visual weight. Default: "primary". */
    variant?: ButtonVariant;
    /** Height and padding. "icon" makes a square button: give it an aria-label. Default: "md". */
    size?: ButtonSize;
    class?: string;
    children?: Snippet;
  };
  export type ButtonProps = Base &
    (
      | (Omit<HTMLButtonAttributes, "class" | "children"> & { href?: undefined })
      | (Omit<HTMLAnchorAttributes, "class" | "children" | "type"> & { href: string; disabled?: boolean; type?: undefined })
    );

  /** The class list for a button. Useful when you style a router's link. */
  export function buttonClasses({
    variant = "primary",
    size = "md",
    className,
  }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
    return ["vin-btn", variant !== "primary" && `vin-btn--${variant}`, size !== "md" && `vin-btn--${size}`, className]
      .filter(Boolean)
      .join(" ");
  }
</script>

<script lang="ts">
  let { variant, size, class: className, children, href, disabled, type, onclick, ...rest }: ButtonProps = $props();

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && size === "icon" && !rest["aria-label"] && !rest["aria-labelledby"]) {
      console.warn("VinUI Button: icon-only buttons need an aria-label so screen readers can name them.");
    }
  };
  warnIfUnnamed();

  const classes = $derived(buttonClasses({ variant, size, className }));
  const anchor = $derived(rest as HTMLAnchorAttributes);
</script>

{#if typeof href === "string"}
  <a
    {...anchor}
    {href}
    class={classes}
    aria-disabled={disabled || undefined}
    tabindex={disabled ? -1 : anchor.tabindex}
    onclick={disabled ? (e: MouseEvent) => e.preventDefault() : (onclick as HTMLAnchorAttributes["onclick"])}
  >{@render children?.()}</a>
{:else}
  <button
    {...rest as HTMLButtonAttributes}
    type={type ?? "button"}
    {disabled}
    class={classes}
    onclick={onclick as HTMLButtonAttributes["onclick"]}
  >{@render children?.()}</button>
{/if}
