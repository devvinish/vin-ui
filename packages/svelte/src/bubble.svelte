<!--
  VinUI · Bubble (Svelte). API: spec/bubble.json.
  A chat bubble: the assistant on the start side, the person on the end side in the accent tint.
  Parts: bubble-group (BubbleGroup), bubble-typing (TypingBubble).
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Who is speaking. "user" sits on the end side, tinted with the accent. Default: "assistant". */
    from?: "assistant" | "user";
    /** With from="user": a solid accent fill instead of a tint. */
    solid?: boolean;
    /** The element to render. Use "p" for a single line of text. Default: "div". */
    as?: "div" | "p";
    class?: string;
    children?: Snippet;
  };
  let { from = "assistant", solid = false, as = "div", class: className, children, ...rest }: Props = $props();
</script>

<svelte:element
  this={as}
  {...rest}
  class={["vin-bubble", from === "user" && "vin-bubble--user", from === "user" && solid && "vin-bubble--solid", className].filter(Boolean).join(" ")}
>
  {@render children?.()}
</svelte:element>
