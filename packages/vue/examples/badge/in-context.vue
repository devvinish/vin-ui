<script setup lang="ts">
import Badge from "@/components/vin/badge.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <Button variant="secondary">
    Inbox
    <Badge variant="primary">12</Badge>
  </Button>
  <Button variant="outline">
    Releases
    <Badge variant="success">New</Badge>
  </Button>
</template>
