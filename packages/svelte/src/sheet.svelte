<!--
  VinUI · Sheet (Svelte). API: spec/sheet.json. Needs dialog.svelte next to it.
  A Dialog that slides in from an edge. Same props and snippets as Dialog, plus `side`.
    <Sheet side="left" title="VinUI">
      {#snippet trigger(props)}<Button {...props}>Menu</Button>{/snippet}
      …
    </Sheet>
-->
<script lang="ts">
  import Dialog, { type DialogProps } from "./dialog.svelte";

  type Props = DialogProps & {
    /** The edge it comes from. Default "right". */
    side?: "right" | "left" | "top" | "bottom";
  };
  let { side = "right", class: className, open = $bindable(false), ...rest }: Props = $props();
</script>

<Dialog {...rest} bind:open data-side={side === "right" ? undefined : side} class={["vin-sheet", className].filter(Boolean).join(" ")} />
