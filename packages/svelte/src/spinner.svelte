<!--
  VinUI · Spinner (Svelte). API: spec/spinner.json.
  On its own: role="status" with a label. Next to text that says what's loading: decorative (hidden).
  <Loading> (spinner-loading.svelte) is a spinner with a message.
-->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, "class"> & {
    size?: "sm" | "md" | "lg";
    /** "primary" uses the accent colour; the default takes the text colour. */
    variant?: "current" | "primary";
    /** What screen readers hear. Default: "Loading". */
    label?: string;
    /** Hide it from screen readers, when text next to it already says it. */
    decorative?: boolean;
    class?: string;
  };
  let { size = "md", variant = "current", label = "Loading", decorative = false, class: className, ...rest }: Props = $props();

  const a11y = $derived(decorative ? { "aria-hidden": true as const } : { role: "status", "aria-label": label });
</script>

<span
  {...a11y}
  {...rest}
  class={["vin-spinner", size !== "md" && `vin-spinner--${size}`, variant === "primary" && "vin-spinner--primary", className].filter(Boolean).join(" ")}
></span>
