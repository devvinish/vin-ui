<!--
  VinUI · Badge (Svelte)
  API: spec/badge.json. Styling comes from @vinui/styles (the vin-badge classes),
  so this file is the same for all 8 styles.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "outline";

  export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "class"> & {
    /** Colour and meaning. Default: "neutral". */
    variant?: BadgeVariant;
    /** Show a status dot before the label. */
    dot?: boolean;
    class?: string;
    children?: Snippet;
  };

  /** The class list for a badge. */
  export function badgeClasses({ variant = "neutral", className }: { variant?: BadgeVariant; className?: string } = {}): string {
    return ["vin-badge", variant !== "neutral" && `vin-badge--${variant}`, className].filter(Boolean).join(" ");
  }
</script>

<script lang="ts">
  let { variant, dot = false, class: className, children, ...rest }: BadgeProps = $props();
</script>

<span {...rest} class={badgeClasses({ variant, className })}>{#if dot}<span class="vin-badge__dot" aria-hidden="true"></span>{/if}{@render children?.()}</span>
