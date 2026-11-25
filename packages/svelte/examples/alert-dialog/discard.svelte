<script lang="ts">
  import AlertDialog from "@/components/vin/alert-dialog.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<AlertDialog title="Discard your changes?" description="You have edits that aren't saved yet." cancel="Keep editing" action="Discard" variant="default">
  {#snippet trigger(props)}<Button variant="outline" {...props}>Close editor</Button>{/snippet}
</AlertDialog>
