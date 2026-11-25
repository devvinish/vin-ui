<script lang="ts">
  import ButtonGroup from "@/components/vin/button-group.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<ButtonGroup aria-label="Save">
  <Button>Save changes</Button>
  <Button size="icon" aria-label="More save options">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
  </Button>
</ButtonGroup>
