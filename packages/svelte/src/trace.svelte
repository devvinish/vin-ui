<!--
  VinUI · Trace (Svelte). API: spec/trace.json.
  What an agent did, step by step: an ordered list of <TraceStep>s (trace-step.svelte) with a
  status icon, a title, the kind and duration, and details behind a native <details>.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLOlAttributes } from "svelte/elements";

  type Props = Omit<HTMLOlAttributes, "class"> & {
    /** Name for the list. Default: "Agent steps". */
    label?: string;
    class?: string;
    children?: Snippet;
  };
  let { label = "Agent steps", class: className, children, ...rest }: Props = $props();
</script>

<ol aria-label={label} {...rest} class={["vin-trace", className].filter(Boolean).join(" ")}>{@render children?.()}</ol>
