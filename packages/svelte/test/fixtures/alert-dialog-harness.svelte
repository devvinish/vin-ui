<script lang="ts">
  import AlertDialog from "../../src/alert-dialog.svelte";

  let { onAction, onCancel }: { onAction?: () => void; onCancel?: () => void } = $props();
</script>

<AlertDialog title="Delete this project?" description="You can't undo it." action="Delete project" icon {onAction} {onCancel}>
  {#snippet trigger(props)}<button type="button" {...props}>Delete</button>{/snippet}
</AlertDialog>
