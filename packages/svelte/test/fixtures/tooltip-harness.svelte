<script lang="ts">
  import Tooltip from "../../src/tooltip.svelte";

  let { label = false }: { label?: boolean } = $props();
</script>

<Tooltip content="Add to your library" {label} delay={0}>
  {#snippet children(props)}<button type="button" {...props}>Save</button>{/snippet}
</Tooltip>
