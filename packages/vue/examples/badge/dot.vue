<script setup lang="ts">
import Badge from "@/components/vin/badge.vue";

</script>

<template>
  <Badge variant="success" dot>Online</Badge>
  <Badge variant="warning" dot>Degraded</Badge>
  <Badge variant="danger" dot>Offline</Badge>
  <Badge dot>Paused</Badge>
</template>
