<script setup lang="ts">
import ToggleGroup, { ToggleGroupItem } from "@/components/vin/toggle-group.vue";

</script>

<template>
  <ToggleGroup type="single" variant="outline" default-value="grid" aria-label="View">
    <ToggleGroupItem value="list">List</ToggleGroupItem>
    <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
    <ToggleGroupItem value="board">Board</ToggleGroupItem>
  </ToggleGroup>
</template>
