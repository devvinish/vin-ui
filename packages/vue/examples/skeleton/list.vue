<script setup lang="ts">
import Skeleton from "@/components/vin/skeleton.vue";


const rows = [["40%", "90%"], ["55%", "75%"], ["35%", "80%"]];
</script>

<template>
  <div role="status" aria-label="Loading messages" style="display: grid; gap: 18px; width: 100%; max-width: 320px">
    <div v-for="([a, b], i) in rows" :key="i" style="display: flex; align-items: center; gap: 12px">
      <Skeleton shape="circle" style="width: 36px" />
      <div style="flex: 1; display: grid; gap: 8px">
        <Skeleton shape="text" :style="{ width: a }" />
        <Skeleton shape="text" :style="{ width: b }" />
      </div>
    </div>
  </div>
</template>
