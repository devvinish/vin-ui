<script lang="ts">
  import Dialog from "../../src/dialog.svelte";
  import Field from "../../src/input-field.svelte";

  let { onOpenChange, onSubmit }: { onOpenChange?: (open: boolean) => void; onSubmit?: (data: FormData) => void } = $props();
  let open = $state(false);
</script>

<Dialog title="Edit profile" description="Change your details." bind:open {onOpenChange} {onSubmit}>
  {#snippet trigger(props)}<button type="button" {...props}>Open</button>{/snippet}
  <Field label="Name" name="name" value="Ada" />
  {#snippet footer(close)}
    <button type="button" onclick={close}>Cancel</button>
    <button type="submit" value="save">Save</button>
  {/snippet}
</Dialog>
<output data-testid="state">{open ? "open" : "closed"}</output>
