<script lang="ts">
  import Popover from "@/components/vin/popover.svelte";
  import Button from "@/components/vin/button.svelte";
  import InputGroup from "@/components/vin/input-group.svelte";
</script>

<Popover title="Share this page" description="Anyone with the link can view it." align="end" style="width: 300px">
  {#snippet trigger(props)}<Button {...props}>Share</Button>{/snippet}
  <InputGroup aria-label="Link" value="https://vinish.dev/ui/s/8f2k" readonly>
    {#snippet end()}<Button variant="ghost" size="sm">Copy</Button>{/snippet}
  </InputGroup>
</Popover>
