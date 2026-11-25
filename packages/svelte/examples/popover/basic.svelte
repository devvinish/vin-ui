<script lang="ts">
  import Popover from "@/components/vin/popover.svelte";
  import Button from "@/components/vin/button.svelte";
  import Link from "@/components/vin/typography-link.svelte";
</script>

<Popover title="Team plan">
  {#snippet trigger(props)}<Button variant="outline" {...props}>About this plan</Button>{/snippet}
  {#snippet description()}Up to 10 people share one theme and one set of components. <Link href="#plans">Compare plans</Link>{/snippet}
</Popover>
