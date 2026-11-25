<script setup lang="ts">
import AlertDialog from "@/components/vin/alert-dialog.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <AlertDialog
    icon
    title="Revoke this API key?"
    description="Apps that use it stop working at once. Make a new key first if you still need access."
    cancel="Keep key"
    action="Revoke key"
  >
    <template #trigger><Button variant="outline">Revoke key</Button></template>
  </AlertDialog>
</template>
