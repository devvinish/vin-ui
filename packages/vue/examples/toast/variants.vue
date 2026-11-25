<script setup lang="ts">
import Toaster, { toast } from "@/components/vin/toast.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <Button variant="outline" @click="toast({ title: 'Payment received', description: 'We\'ve emailed your receipt.', variant: 'success' })">Success</Button>
  <Button variant="outline" @click="toast({ title: 'Upload failed', description: 'The file is larger than 10 MB.', variant: 'danger' })">Error</Button>
  <Button variant="outline" @click="toast({ title: 'Message archived', action: { label: 'Undo', onClick: () => {} } })">With action</Button>
  <Toaster />
</template>
