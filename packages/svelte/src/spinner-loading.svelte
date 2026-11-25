<!--
  VinUI · Loading (Svelte). A spinner with a message. Screen readers announce the message.
  Part of spinner.svelte.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    size?: "sm" | "md" | "lg";
    variant?: "current" | "primary";
    class?: string;
    children?: Snippet;
  };
  let { size = "md", variant = "current", class: className, children, ...rest }: Props = $props();
</script>

<div role="status" {...rest} class={["vin-loading", className].filter(Boolean).join(" ")}>
  <span
    aria-hidden="true"
    class={["vin-spinner", size !== "md" && `vin-spinner--${size}`, variant === "primary" && "vin-spinner--primary"].filter(Boolean).join(" ")}
  ></span>
  {@render children?.()}
</div>
