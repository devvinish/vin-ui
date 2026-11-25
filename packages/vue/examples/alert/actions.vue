<script setup lang="ts">
import { ref } from "vue";
import Alert from "@/components/vin/alert.vue";
import Button from "@/components/vin/button.vue";


const open = ref(true);
</script>

<template>
  <Alert v-if="open" variant="warning" title="Storage almost full" style="max-width: 480px" @dismiss="open = false">
    You've used 9.2 GB of 10 GB. Upgrade or delete old files.
    <template #actions>
      <Button size="sm">Upgrade</Button>
      <Button variant="outline" size="sm">Manage files</Button>
    </template>
  </Alert>
</template>
