<script lang="ts">
  import Tooltip from "@/components/vin/tooltip.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<Tooltip content="On top" side="top">
  {#snippet children(props)}<Button variant="outline" size="sm" {...props}>Top</Button>{/snippet}
</Tooltip>
<Tooltip content="On the right" side="right">
  {#snippet children(props)}<Button variant="outline" size="sm" {...props}>Right</Button>{/snippet}
</Tooltip>
<Tooltip content="Below" side="bottom">
  {#snippet children(props)}<Button variant="outline" size="sm" {...props}>Bottom</Button>{/snippet}
</Tooltip>
<Tooltip content="On the left" side="left">
  {#snippet children(props)}<Button variant="outline" size="sm" {...props}>Left</Button>{/snippet}
</Tooltip>
