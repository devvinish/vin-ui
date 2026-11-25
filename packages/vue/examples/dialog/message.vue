<script setup lang="ts">
import Dialog, { DialogClose } from "@/components/vin/dialog.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <Dialog title="Your site is live" description="Anyone with the link can see it now. It can take a minute to show up everywhere.">
    <template #trigger><Button>Publish</Button></template>
    <template #footer><DialogClose><Button>Got it</Button></DialogClose></template>
  </Dialog>
</template>
