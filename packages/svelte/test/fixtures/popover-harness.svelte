<script lang="ts">
  import Popover from "../../src/popover.svelte";

  let { onOpenChange }: { onOpenChange?: (open: boolean) => void } = $props();
  let open = $state(false);
</script>

<Popover title="Dimensions" description="Set the size." bind:open {onOpenChange}>
  {#snippet trigger(props)}<button type="button" {...props}>Dimensions</button>{/snippet}
  <p>Body</p>
</Popover>
<button type="button" onclick={() => (open = !open)}>Toggle from outside</button>
