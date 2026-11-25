<script lang="ts">
  import Drawer from "../../src/drawer.svelte";

  let { dismissible = true, onOpenChange }: { dismissible?: boolean; onOpenChange?: (open: boolean) => void } = $props();
  let open = $state(false);
</script>

<Drawer title="Daily goal" description="Minutes a day." {dismissible} bind:open {onOpenChange}>
  {#snippet trigger(props)}<button type="button" {...props}>Set goal</button>{/snippet}
  <p>Body</p>
  {#snippet footer(close)}<button type="button" onclick={close}>Save goal</button>{/snippet}
</Drawer>
<p data-testid="state">{open ? "open" : "closed"}</p>
