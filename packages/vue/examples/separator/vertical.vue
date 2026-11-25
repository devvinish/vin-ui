<script setup lang="ts">
import Button from "@/components/vin/button.vue";
import Separator from "@/components/vin/separator.vue";

</script>

<template>
  <div style="display: flex; align-items: center; gap: 4px">
    <Button variant="ghost" size="sm">Docs</Button>
    <Separator orientation="vertical" />
    <Button variant="ghost" size="sm">Components</Button>
    <Separator orientation="vertical" />
    <Button variant="ghost" size="sm">Blog</Button>
  </div>
</template>
