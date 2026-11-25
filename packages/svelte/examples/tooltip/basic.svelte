<script lang="ts">
  import Tooltip from "@/components/vin/tooltip.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<Tooltip content="Add to your library">
  {#snippet children(props)}<Button variant="outline" {...props}>Save</Button>{/snippet}
</Tooltip>
