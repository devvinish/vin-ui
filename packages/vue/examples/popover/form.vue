<script setup lang="ts">
import Popover from "@/components/vin/popover.vue";
import Button from "@/components/vin/button.vue";
import Field from "@/components/vin/input.vue";

</script>

<template>
  <Popover title="Dimensions" description="Set the size of the layer." style="width: 260px">
    <template #trigger><Button variant="outline">Dimensions</Button></template>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
      <Field label="Width" size="sm" default-value="1200" />
      <Field label="Height" size="sm" default-value="800" />
    </div>
  </Popover>
</template>
