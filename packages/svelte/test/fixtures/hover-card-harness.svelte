<script lang="ts">
  import HoverCard from "../../src/hover-card.svelte";

  let { onOpenChange }: { onOpenChange?: (open: boolean) => void } = $props();
</script>

<div>
  Typography by
  <HoverCard {onOpenChange}>
    {#snippet trigger(props)}<a href="#ada" {...props}>@ada</a>{/snippet}
    <p class="vin-popover__title">Ada Lovelace</p>
    <a href="#profile">Profile</a>
  </HoverCard>
</div>
<button type="button">Elsewhere</button>
