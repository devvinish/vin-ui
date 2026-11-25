<!--
  VinUI · Progress (Svelte). API: spec/progress.json.
  Leave out `value` while the amount is unknown: the bar slides and has no aria-valuenow.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    /** 0 to max. Leave it out for an indeterminate bar. */
    value?: number;
    max?: number;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "success";
    /** Shown above the bar and used as its name. Without it, pass an aria-label. */
    label?: string | Snippet;
    /** Show the percentage next to the label. */
    showValue?: boolean;
    class?: string;
  };
  let { value, max = 100, size = "md", variant = "default", label, showValue = false, class: className, style, ...rest }: Props = $props();

  const uid = $props.id();
  const labelId = `vin-${uid}-label`;
  const known = $derived(value != null);
  const pct = $derived(value != null ? Math.round((Math.min(max, Math.max(0, value)) / max) * 100) : 0);
  const barStyle = $derived([label ? undefined : style, known ? `--vin-value: ${pct}%` : undefined].filter(Boolean).join("; ") || undefined);
</script>

{#snippet bar()}
  <div
    role="progressbar"
    aria-labelledby={label ? labelId : undefined}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={known ? pct : undefined}
    {...rest}
    class={[
      "vin-progress",
      size !== "md" && `vin-progress--${size}`,
      variant === "success" && "vin-progress--success",
      !known && "vin-progress--indeterminate",
      !label && className,
    ]
      .filter(Boolean)
      .join(" ")}
    style={barStyle}
  ></div>
{/snippet}

{#if !label}
  {@render bar()}
{:else}
  <div class={["vin-field", className].filter(Boolean).join(" ")} {style}>
    <div class="vin-progress__head">
      <span class="vin-label" id={labelId}>{#if typeof label === "function"}{@render label()}{:else}{label}{/if}</span>
      {#if showValue && known}<span class="vin-progress__value">{pct}%</span>{/if}
    </div>
    {@render bar()}
  </div>
{/if}
