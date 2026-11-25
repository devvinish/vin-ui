<script setup lang="ts">
import Dialog, { DialogClose } from "@/components/vin/dialog.vue";
import Field from "@/components/vin/input.vue";
import Button from "@/components/vin/button.vue";


const onSave = (data: FormData) => console.log(Object.fromEntries(data));
</script>

<template>
  <Dialog title="Edit profile" description="Change your public details. Save when you're done." @submit="onSave">
    <template #trigger><Button variant="outline">Edit profile</Button></template>
    <Field label="Name" name="name" default-value="Ada Lovelace" autocomplete="name" />
    <Field label="Username" name="username" default-value="@ada" autocomplete="username" />
    <template #footer>
      <DialogClose><Button variant="outline">Cancel</Button></DialogClose>
      <Button type="submit" value="save">Save changes</Button>
    </template>
  </Dialog>
</template>
