<script setup lang="ts">
import AlertDialog from "@/components/vin/alert-dialog.vue";
import Button from "@/components/vin/button.vue";


const description = `This deletes "Website redesign" and its 24 files for everyone. You can't undo it.`;
const onDelete = () => console.log("deleted");
</script>

<template>
  <AlertDialog
    title="Delete this project?"
    :description="description"
    action="Delete project"
    @action="onDelete"
  >
    <template #trigger><Button variant="danger">Delete project</Button></template>
  </AlertDialog>
</template>
