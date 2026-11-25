<script lang="ts">
  import Dialog from "@/components/vin/dialog.svelte";
  import Button from "@/components/vin/button.svelte";
  import Field from "@/components/vin/input-field.svelte";
</script>

<Dialog
  title="Edit profile"
  description="Change your public details. Save when you're done."
  onSubmit={(data) => console.log(Object.fromEntries(data))}
>
  {#snippet trigger(props)}<Button variant="outline" {...props}>Edit profile</Button>{/snippet}
  <Field label="Name" name="name" value="Ada Lovelace" autocomplete="name" />
  <Field label="Username" name="username" value="@ada" autocomplete="username" />
  {#snippet footer(close)}
    <Button variant="outline" onclick={close}>Cancel</Button>
    <Button type="submit" value="save">Save changes</Button>
  {/snippet}
</Dialog>
