<script lang="ts">
  import AlertDialog from "@/components/vin/alert-dialog.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<AlertDialog
  title="Delete this project?"
  description={`This deletes "Website redesign" and its 24 files for everyone. You can't undo it.`}
  action="Delete project"
  onAction={() => console.log("deleted")}
>
  {#snippet trigger(props)}<Button variant="danger" {...props}>Delete project</Button>{/snippet}
</AlertDialog>
