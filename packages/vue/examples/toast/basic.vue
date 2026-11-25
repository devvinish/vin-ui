<script setup lang="ts">
import Toaster, { toast } from "@/components/vin/toast.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <Button variant="outline" @click="toast('Changes saved')">Save changes</Button>
  <Toaster />
</template>
