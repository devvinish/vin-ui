<script setup lang="ts">
import AlertDialog from "@/components/vin/alert-dialog.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <AlertDialog
    title="Discard your changes?"
    description="You have edits that aren't saved yet."
    cancel="Keep editing"
    action="Discard"
    variant="default"
  >
    <template #trigger><Button variant="outline">Close editor</Button></template>
  </AlertDialog>
</template>
