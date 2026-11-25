<script lang="ts">
  import AlertDialog from "@/components/vin/alert-dialog.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<AlertDialog
  icon
  title="Revoke this API key?"
  description="Apps that use it stop working at once. Make a new key first if you still need access."
  cancel="Keep key"
  action="Revoke key"
>
  {#snippet trigger(props)}<Button variant="outline" {...props}>Revoke key</Button>{/snippet}
</AlertDialog>
