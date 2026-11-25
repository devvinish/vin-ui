<script lang="ts">
  import Alert from "@/components/vin/alert.svelte";
  import Button from "@/components/vin/button.svelte";

  let open = $state(true);
</script>

{#if open}
  <Alert variant="warning" title="Storage almost full" style="max-width: 480px" onDismiss={() => (open = false)}>
    You've used 9.2 GB of 10 GB. Upgrade or delete old files.
    {#snippet actions()}
      <Button size="sm">Upgrade</Button>
      <Button variant="outline" size="sm">Manage files</Button>
    {/snippet}
  </Alert>
{/if}
