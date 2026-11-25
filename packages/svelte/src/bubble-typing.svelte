<!--
  VinUI · Typing Bubble (Svelte). Part of bubble.svelte.
  Three animated dots while a reply is on its way. They stay still for people who reduce motion.
-->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    /** What screen readers hear. Default: "Assistant is typing". */
    label?: string;
    class?: string;
  };
  let { label = "Assistant is typing", class: className, ...rest }: Props = $props();
</script>

<div role="status" {...rest} class={["vin-bubble vin-bubble--typing", className].filter(Boolean).join(" ")}>
  <span class="vin-bubble__dot"></span>
  <span class="vin-bubble__dot"></span>
  <span class="vin-bubble__dot"></span>
  <span class="vin-bubble__label">{label}</span>
</div>
